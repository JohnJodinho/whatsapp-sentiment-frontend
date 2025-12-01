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
}

const radarColors = [
  { name: "p1", stroke: "hsl(var(--mint))", fill: "hsl(var(--mint) / 0.3)" },
  { name: "p2", stroke: "hsl(var(--cyan-accent))", fill: "hsl(var(--cyan-accent) / 0.3)" },
  { name: "p3", stroke: "hsl(var(--blue-accent))", fill: "hsl(var(--blue-accent) / 0.3)" },
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

export function ActivityChart({ isLoading, data }: ActivityChartProps) {
  const { tickColor } = useChartColors();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (data?.participants) {
      setSelectedParticipants(data.participants.map(p => p.name));
    }
  }, [data]);

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
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px]">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Communication Style</CardTitle>
          <CardDescription>Breakdown of message types.</CardDescription>
        </div>
        {data.participants.length === 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <span className="hidden sm:inline">{selectedParticipants.length === 3 ? "Top Three" : `${selectedParticipants.length} selected`}</span>
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
      
      {/* Scroll Container for Mobile */}
      <CardContent className="h-[350px] overflow-hidden">
        <div className="h-full w-full overflow-x-auto overflow-y-hidden">
             <ChartContainer config={{}} className="h-full w-full min-w-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
                  <PolarAngleAxis dataKey="style" tick={{ fill: tickColor, fontSize: 11 }} />
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
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
                                const color = radarColors[participantIndex % radarColors.length];
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
                  {data.participants.map((p, index) => {
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
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
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