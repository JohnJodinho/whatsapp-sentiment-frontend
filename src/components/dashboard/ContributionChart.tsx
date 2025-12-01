"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart"; // Removed unused ChartContainer
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContributionPieChart } from "./ContributionPieChart";

// --- PROPS & TYPES ---
type MultiParticipantData = { name: string; messages: number }[];
type TwoParticipantData = {
  participants: { name: string; messages: number }[];
  totalMessages: number;
};
type SingleParticipantData = {
  name: string;
  percentage: number;
  othersPercentage: number;
};
export type ContributionChartData =
  | { type: "multi"; data: MultiParticipantData }
  | { type: "two"; data: TwoParticipantData }
  | { type: "single"; data: SingleParticipantData };

interface ContributionChartProps {
  isLoading: boolean;
  data: ContributionChartData | null;
}

function useChartColors() {
  const { theme } = useTheme();
  const [tickColor, setTickColor] = useState("#888888");
  useEffect(() => {
    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--muted-foreground')
      .trim();
    setTickColor(computedColor || "#888888");
  }, [theme]);
  return { tickColor };
}

export function ContributionChart({ isLoading, data }: ContributionChartProps) {
  const { tickColor } = useChartColors();
  const [topN, setTopN] = useState("30"); 
  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredBarData = useMemo(() => {
    if (!data || data.type !== "multi") return [];
    return data.data
      .sort((a, b) => b.messages - a.messages)
      .slice(0, parseInt(topN, 10));
  }, [data, topN]);

  if (isLoading) {
    return <Skeleton className="h-[450px] rounded-2xl" />;
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[450px] flex items-center justify-center">
        <p className="text-muted-foreground">No contribution data available.</p>
      </Card>
    );
  }

  // --- 1. MULTI-PARTICIPANT BAR CHART ---
  if (data.type === "multi") {
    const barHeight = 40; 
    const minHeight = 300;
    const computedHeight = filteredBarData.length * barHeight;
    const chartHeight = Math.max(minHeight, computedHeight); 

    // Explicitly define the radius type for Recharts
    const barRadius: [number, number, number, number] = [0, 4, 4, 0];

    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">Message Contribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Messages sent by participant.</CardDescription>
          </div>
          <Select value={topN} onValueChange={setTopN}>
            <SelectTrigger className="w-[100px] sm:w-[120px] h-8 text-xs">
              <SelectValue placeholder="Show Top" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="30">Top 30</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        
        <CardContent className="flex-1 w-full overflow-hidden p-0 relative">
          <div className="h-full w-full overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 p-4">
             <div style={{ height: `${chartHeight}px`, minWidth: isMobile ? "400px" : "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredBarData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mintGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--mint))" />
                        <stop offset="100%" stopColor="hsl(var(--blue-accent))" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} horizontal={false} />
                    <XAxis type="number" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }} 
                        tickLine={false} 
                        axisLine={false} 
                        width={isMobile ? 100 : 130} 
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-card/95 p-2 shadow-md backdrop-blur-sm text-xs">
                              <span className="font-bold text-foreground">{payload[0].payload.name}</span>
                              <div className="text-muted-foreground">{payload[0].value?.toLocaleString()} messages</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                        dataKey="messages" 
                        fill="url(#mintGradient)" 
                        radius={barRadius} 
                        barSize={20}
                        background={{ fill: 'hsl(var(--muted))', opacity: 0.1, radius: 4 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- 2. TWO-PARTICIPANT PIE CHART ---
  if (data.type === "two") {
    const [p1, p2] = data.data.participants;
    
    const pieData = [
      { name: p1.name, messages: p1.messages, fill: "hsl(var(--mint))" },
      { name: p2.name, messages: p2.messages, fill: "hsl(var(--blue-accent))" },
    ];
    
    const chartConfig = {
      messages: { label: "Messages" },
      [p1.name]: { label: p1.name, color: "hsl(var(--mint))" },
      [p2.name]: { label: p2.name, color: "hsl(var(--blue-accent))" },
    } satisfies ChartConfig;

    return (
      <ContributionPieChart
        title="Message Contribution"
        description="Share of messages between participants."
        pieData={pieData}
        chartConfig={chartConfig}
        dataKey="messages"
        nameKey="name"
        labelFormatter={(val) => ((val / data.data.totalMessages) * 100).toFixed(0) + "%"}
      />
    );
  }

  // --- 3. SINGLE-PARTICIPANT PIE CHART ---
  if (data.type === "single") {
    const pieData = [
      { name: data.data.name, percentage: data.data.percentage, fill: "hsl(var(--mint))" },
      { name: "Others", percentage: data.data.othersPercentage, fill: "hsl(var(--blue-accent))" },
    ];
    
    const chartConfig = {
      percentage: { label: "Percentage" },
      [data.data.name]: { label: data.data.name, color: "hsl(var(--mint))" },
      Others: { label: "Others", color: "hsl(var(--blue-accent))" },
    } satisfies ChartConfig;

    return (
      <ContributionPieChart
        title="Share of Voice"
        description="Participant's share of all messages."
        pieData={pieData}
        chartConfig={chartConfig}
        dataKey="percentage"
        nameKey="name"
        labelFormatter={(val) => `${val.toFixed(0)}%`}
      />
    );
  }

  return null;
}