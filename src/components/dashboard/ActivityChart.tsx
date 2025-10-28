"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes"; // FIX 1: This is now used by the hook below
import {
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  CartesianGrid, // FIX 2: Added missing import
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

// --- PROPS & TYPES ---
type ActivityParticipant = { name: string; data: number[] };
export type ActivityChartData = {
  labels: string[];
  participants: ActivityParticipant[];
} | null; // Nullable for prop-passing

interface ActivityChartProps {
  isLoading: boolean;
  data: ActivityChartData;
}

// --- Chart Colors ---
const radarColors = [
  { name: "p1", stroke: "hsl(var(--mint))", fill: "hsl(var(--mint) / 0.3)" },
  { name: "p2", stroke: "hsl(var(--cyan-accent))", fill: "hsl(var(--cyan-accent) / 0.3)" },
  { name: "p3", stroke: "hsl(var(--blue-accent))", fill: "hsl(var(--blue-accent) / 0.3)" },
];

// --- FIX 3: Add the missing useChartColors hook ---
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

// --- MAIN REFACTORED COMPONENT ---
export function ActivityChart({ isLoading, data }: ActivityChartProps) {
  const { tickColor } = useChartColors(); // This line now works
  
  // State for the 3-participant filter
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Initialize filter state when data changes
  useEffect(() => {
    if (data?.participants) {
      setSelectedParticipants(data.participants.map(p => p.name));
    }
  }, [data]);

  // Re-format API data for the Recharts RadarChart component
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.labels.map((label, i) => {
      // --- FIX 4: Corrected 'any' type ---
      const entry: { [key: string]: string | number } = { style: label };
      data.participants.forEach(p => {
        entry[p.name] = p.data[i];
      });
      return entry;
    });
  }, [data]);

  // --- 1. SKELETON STATE ---
  if (isLoading) {
    return <Skeleton className="h-[400px] rounded-2xl" />;
  }

  // --- 2. EMPTY STATE ---
  if (!data) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No activity data available.</p>
      </Card>
    );
  }

  // --- 3. MAIN RENDER ---
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px]">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div>
          <CardTitle>Communication Style Profile</CardTitle>
          <CardDescription>Breakdown of message types.</CardDescription>
        </div>
        {/* 3-Participant Filter */}
        {data.participants.length === 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                {selectedParticipants.length === 3 ? "Top Three" : `${selectedParticipants.length} selected`}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <PolarAngleAxis dataKey="style" tick={{ fill: tickColor, fontSize: 12 }} />
              <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card/80 p-2 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">{payload[0].payload.style}</span>
                          {/* Dynamic Tooltip */}
                          {payload.map((entry, index) => {
                            // Find the original participant color, fallback to index
                            const originalParticipant = data.participants.find(p => p.name === entry.name);
                            const participantIndex = originalParticipant ? data.participants.indexOf(originalParticipant) : index;
                            const color = radarColors[participantIndex % radarColors.length];
                            
                            return (
                              <span key={entry.name} style={{ color: color.stroke }}>
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
              {/* Dynamic Radar Rendering */}
              {data.participants.map((p, index) => {
                // Only render if selected in the filter
                if (!selectedParticipants.includes(p.name)) return null;
                
                const color = radarColors[index % radarColors.length];
                return (
                  <Radar
                    key={p.name}
                    name={p.name}
                    dataKey={p.name}
                    stroke={color.stroke}
                    fill={color.fill}
                    fillOpacity={0.6}
                  />
                );
              })}
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}