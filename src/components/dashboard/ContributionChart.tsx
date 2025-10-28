"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContributionPieChart } from "./ContributionPieChart";

// --- PROPS & TYPES (from prompt) ---
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

// --- HELPER (from existing code) ---
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


// --- MAIN REFACTORED COMPONENT ---
export function ContributionChart({ isLoading, data }: ContributionChartProps) {
  const { tickColor } = useChartColors();
  const [topN, setTopN] = useState("30"); // State for "Top N" filter

  // Memoize sorted/filtered data for the bar chart
  const filteredBarData = useMemo(() => {
    if (!data || data.type !== "multi") return [];
    return data.data
      .sort((a, b) => b.messages - a.messages) // Sort descending
      .slice(0, parseInt(topN, 10)); // Apply "Top N" filter
  }, [data, topN]);

  // --- 1. SKELETON STATE ---
  if (isLoading) {
    return <Skeleton className="h-[400px] rounded-2xl" />;
  }

  // --- 2. EMPTY STATE ---
  if (!data) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No contribution data available.</p>
      </Card>
    );
  }

  // --- 3. MULTI-PARTICIPANT BAR CHART STATE ---
  if (data.type === "multi") {
    const barHeight = 35
    const chartHeight = Math.max(300, filteredBarData.length * barHeight); 
    // Dynamic height for scrolling
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <div>
            <CardTitle>Message Contribution</CardTitle>
            <CardDescription>Messages sent by participant.</CardDescription>
          </div>
          {/* "Top N" Filter */}
          <Select value={topN} onValueChange={setTopN}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Show Top" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Top 3</SelectItem>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="30">Top 30</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        {/* Scrollable Content Area */}
        <CardContent className="h-[300px] w-full overflow-y-auto pr-4">
          <ChartContainer config={{}} style={{ height: `${chartHeight}px`}} className="w-full">
            {/* ResponsiveContainer has dynamic height to enable scrolling */}
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={filteredBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <defs>
                  <linearGradient id="mintGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--mint))" />
                    <stop offset="100%" stopColor="hsl(var(--blue-accent))" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} horizontal={false} />
                <XAxis type="number" tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={false} width={120} />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card/80 p-2 shadow-sm backdrop-blur-sm">
                          <span className="font-bold text-foreground">{payload[0].payload.name}: {payload[0].value} messages</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="messages" fill="url(#mintGradient)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // --- 4. TWO-PARTICIPANT PIE CHART STATE ---
  if (data.type === "two") {
    const [p1, p2] = data.data.participants;
    const pieData = [
      { name: p1.name, messages: p1.messages, fill: "hsl(var(--mint))" },
      { name: p2.name, messages: p2.messages, fill: "hsl(var(--cyan-accent))" },
    ];
    const chartConfig = {
      messages: { label: "Messages" },
      [p1.name]: { label: p1.name, color: "hsl(var(--mint))" },
      [p2.name]: { label: p2.name, color: "hsl(var(--cyan-accent))" },
    } satisfies ChartConfig;

    return (
      <ContributionPieChart
        title="Message Contribution"
        description="Share of messages between participants."
        pieData={pieData}
        chartConfig={chartConfig}
        dataKey="messages"
        nameKey="name"
        labelFormatter={(val) => val.toLocaleString()} // Format as number
      />
    );
  }

  // --- 5. SINGLE-PARTICIPANT PIE CHART STATE ---
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
        title="Share of Voice" // New title
        description="Participant's share of all messages."
        pieData={pieData}
        chartConfig={chartConfig}
        dataKey="percentage"
        nameKey="name"
        labelFormatter={(val) => `${val.toFixed(0)}%`} // Format as percentage
      />
    );
  }

  return null; // Should be unreachable
}