"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type ActivityParticipant = { name: string; data: number[] };
export type ActivityChartData = {
  labels: string[];
  participants: ActivityParticipant[];
} | null;

interface ActivityChartProps {
  isLoading: boolean;
  data: ActivityChartData;
  isExport?: boolean;
}

// Original Theme Colors (CSS Variables)
const themeColors = [
  { name: "p1", stroke: "hsl(var(--mint))", fill: "hsl(var(--mint) / 0.3)" },
  { name: "p2", stroke: "hsl(var(--cyan-accent))", fill: "hsl(var(--cyan-accent) / 0.3)" },
  { name: "p3", stroke: "hsl(var(--blue-accent))", fill: "hsl(var(--blue-accent) / 0.3)" },
];

// Export Colors (Static Hex for PDF stability)
// Using Hex + Alpha for fill (approx 30% opacity)
const exportColors = [
  { name: "p1", stroke: "#2dd4bf", fill: "#2dd4bf4d" }, 
  { name: "p2", stroke: "#22d3ee", fill: "#22d3ee4d" },
  { name: "p3", stroke: "#60a5fa", fill: "#60a5fa4d" },
];

function useChartColors() {
  const { theme } = useTheme();
  const [tickColor, setTickColor] = useState("#c9c9c9ff");
  useEffect(() => {
    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--muted-foreground')
      .trim();
    setTickColor(computedColor || "#c9c9c9ff");
  }, [theme]);
  return { tickColor };
}

export function ActivityChart({ isLoading, data, isExport = false }: ActivityChartProps) {
  const { tickColor } = useChartColors();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Use static black for export to ensure readability on white paper, otherwise use theme color
  const currentTickColor = isExport ? "#000000" : tickColor;
  
  // Select color palette based on mode
  const currentPalette = isExport ? exportColors : themeColors;

  useEffect(() => {
    if (data?.participants) {
      setSelectedParticipants(data.participants.map(p => p.name));
    }
  }, [data]);
  const cardClass = isExport
    ? "rounded-2xl border border-slate-200 bg-white shadow-sm h-auto w-auto"
    : "rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px]";

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.labels.map((label, i) => {
      const entry: { [key: string]: string | number } = { style: label };
      data.participants.forEach(p => {
        entry[p.name] = p.data[i];
      });
      return entry;
    });
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[400px] rounded-2xl" />;
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No activity data available.</p>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Communication Style</CardTitle>
          <CardDescription>Breakdown of message types.</CardDescription>
        </div>
        
        {/* Hide Dropdown in Export Mode */}
        {!isExport && data.participants.length === 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <span className="hidden sm:inline">
                  {selectedParticipants.length === 3 ? "Top Three" : `${selectedParticipants.length} selected`}
                </span>
                <span className="sm:hidden">Filter</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {data.participants.map(p => (
                <DropdownMenuCheckboxItem
                  key={p.name}
                  checked={selectedParticipants.includes(p.name)}
                  onCheckedChange={(checked) => {
                    setSelectedParticipants(prev =>
                      checked ? [...prev, p.name] : prev.filter(name => name !== p.name)
                    );
                  }}
                >
                  {p.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      {/* For Export: remove overflow-hidden to ensure no clipping, 
        though usually fixed height handles it. 
      */}
      <CardContent className={`h-[350px] ${isExport ? '' : 'overflow-hidden'}`}>
        <div className={`h-full w-full ${isExport ? '' : 'overflow-x-auto overflow-y-hidden'}`}>
          <ChartContainer config={{}} className="h-full w-full min-w-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                
                {/* Use static hex for grid in export (slate-300), 
                  otherwise theme border 
                */}
                <CartesianGrid 
                  stroke={isExport ? "#e2e8f0" : "hsl(var(--border))"} 
                  strokeOpacity={0.6} 
                />
                
                <PolarAngleAxis 
                  dataKey="style" 
                  tick={{ fill: currentTickColor, fontSize: 11 }} 
                />
                
                <PolarGrid 
                  stroke={isExport ? "#e2e8f0" : "hsl(var(--border))"} 
                  strokeOpacity={0.6} 
                />
                
                {/* Tooltips are useless in static PDF exports */}
                {!isExport && (
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card/80 p-2 shadow-sm backdrop-blur-sm">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-foreground">{payload[0].payload.style}</span>
                              {payload.map((entry, index) => {
                                const originalParticipant = data.participants.find(p => p.name === entry.name);
                                const participantIndex = originalParticipant ? data.participants.indexOf(originalParticipant) : index;
                                const color = themeColors[participantIndex % themeColors.length];
                                return (
                                  <span key={entry.name} style={{ color: color.stroke }} className="text-xs">
                                    {entry.name}: {entry.value}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                )}

                {data.participants.map((p, index) => {
                  if (!selectedParticipants.includes(p.name)) return null;
                  
                  // Use the calculated palette (Export vs Theme)
                  const color = currentPalette[index % currentPalette.length];
                  
                  return (
                    <Radar
                      key={p.name}
                      name={p.name}
                      dataKey={p.name}
                      stroke={color.stroke}
                      fill={color.fill}
                      fillOpacity={0.6}
                      // Disable animation during export so PDF captures the full shape
                      isAnimationActive={!isExport}
                    />
                  );
                })}
                
                <Legend
                  wrapperStyle={{ 
                    paddingTop: '10px', 
                    fontSize: '12px',
                    // Force black text for legend in export
                    color: isExport ? '#000000' : 'inherit' 
                  }}
                  verticalAlign="bottom"
                  height={36}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}