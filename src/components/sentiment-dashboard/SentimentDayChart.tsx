"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Label, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
// import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import type { DailySentimentBreakdown } from "@/types/sentimentDashboardData";
// --- Data Structure ---

type SentimentByDayData = {
  [key in 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat']?: DailySentimentBreakdown; // Make optional if API might omit days
};

interface SentimentDayChartProps {
  isLoading: boolean;
  data: SentimentByDayData | null;
}

// --- Constants & Config ---
const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
type DayOfWeekKey = typeof daysOfWeek[number];

const dayLabels: Record<DayOfWeekKey, string> = {
  sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
  thu: "Thursday", fri: "Friday", sat: "Saturday"
};

const sentimentColors = {
  positive: "hsl(var(--sentiment-positive))",
  negative: "hsl(var(--sentiment-negative))",
  neutral: "hsl(var(--sentiment-neutral))",
};

// --- Main Component ---
export function SentimentDayChart({ isLoading, data }: SentimentDayChartProps) {
  const id = "sentiment-by-day-donut";
  const [activeDay, setActiveDay] = useState<DayOfWeekKey>("mon"); // Default to Monday
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- Calculations ---
  const activeDayData = useMemo(() => data?.[activeDay], [data, activeDay]);

  const pieData = useMemo(() => {
    if (!activeDayData || activeDayData.total === 0) return [];
    return [
      { name: "Positive", value: activeDayData.positive, fill: sentimentColors.positive },
      { name: "Negative", value: activeDayData.negative, fill: sentimentColors.negative },
      { name: "Neutral", value: activeDayData.neutral, fill: sentimentColors.neutral },
    ].filter(d => d.value > 0); // Only include segments with value > 0
  }, [activeDayData]);

  const activeIndex = useMemo(() => {
    // If we have no data to display, don't try to highlight anything
    if (pieData.length === 0) {
      return undefined;
    }
    
    // Find the largest segment to highlight it
    const maxValue = Math.max(...pieData.map(p => p.value));
    return pieData.findIndex(d => d.value === maxValue);
  }, [pieData]);


  // Responsive radii
  const outerRadius = isMobile ? 90 : 110;
  const innerRadius = isMobile ? 50 : 70;

  // Handle Loading State
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Handle Empty State (if entire data object is null/empty)
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">No daily sentiment data available.</p>
      </Card>
    );
  }

  // Active Shape (optional glow effect)
  const ActiveShape = (props: PieSectorDataItem) => (
    <g style={{ filter: `drop-shadow(0 2px 6px ${props.fill}40)` }}>
      <Sector {...props} outerRadius={outerRadius + 5} stroke="#FFFFFF" strokeWidth={2} />
    </g>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card data-chart={id} className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">Sentiment by Day</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Distribution for selected day</CardDescription>
          </div>
          {/* Day Selector Dropdown */}
          <Select value={activeDay} onValueChange={(val) => setActiveDay(val as DayOfWeekKey)}>
            <SelectTrigger className="h-8 w-[120px] rounded-lg pl-2.5 text-xs" aria-label="Select day">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {daysOfWeek.map((day) => (
                <SelectItem key={day} value={day} className="rounded-lg text-xs">
                  {dayLabels[day]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex-1 flex items-center justify-center px-4 pb-10 pt-0">
          <ChartContainer
            config={{}} // Config not strictly needed if colors are in data
            className="w-full max-w-[250px] aspect-square"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent
                    hideLabel
                    formatter={(value) => {
                       const total = activeDayData?.total ?? 1; // Avoid division by zero
                       const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : "0.0";
                       return `${Number(value).toLocaleString()} (${percentage}%)`;
                    }}
                   className="rounded-lg"
                  />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={1}
                  strokeWidth={1}
                  activeIndex={activeIndex} // Can set if interaction needed
                  activeShape={ActiveShape} // Apply glow effect if desired
                >
                   {/* Center Label: Sentiment Score for the Day */}
                   <Label
                    content={({ viewBox }) => {
                       if (viewBox && "cx" in viewBox && "cy" in viewBox && activeDayData) {
                         const score = activeDayData.score;
                         const scoreColor = score > 5 ? sentimentColors.positive : score < -5 ? sentimentColors.negative : "hsl(var(--hsl-muted-foreground))";
                         return (
                           <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" fill={scoreColor}>
                             <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="text-2xl font-bold" >
                               {score > 0 ? "+" : ""}{score.toFixed(0)}
                             </tspan>
                             <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="text-xs fill-muted-foreground" >
                               Score
                             </tspan>
                           </text>
                         );
                       } return null;
                    }}
                    position="center"
                 />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Reusable Skeleton (can be defined once and imported)
function ChartSkeleton() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm h-[350px] p-4"> {/* Adjust height */}
      <div className="space-y-1.5 mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-[calc(100%-60px)] w-full rounded-md" />
    </Card>
  );
}
