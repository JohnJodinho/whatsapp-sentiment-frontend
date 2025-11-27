"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import  { ChartContainer } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BreakdownDataPoint } from "@/types/sentimentDashboardData";



interface SentimentBreakdownChartProps {
  isLoading: boolean;
  data: BreakdownDataPoint[] | null;
}

function useChartColors() {
   const { theme } = useTheme();
   const [tickColor, setTickColor] = useState("#888888");
    const [gridColor, setGridColor] = useState("rgba(15, 23, 42, 0.06)");
   useEffect(() => {
     const computedTickColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
     const computedGridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
     setTickColor(computedTickColor ? `hsl(${computedTickColor})` : "#888888");
     setGridColor(computedGridColor ? `hsla(${computedGridColor}, 0.5)` : "rgba(15, 23, 42, 0.06)");
   }, [theme]);
   return { tickColor, gridColor };
 }

export function SentimentBreakdownChart({ isLoading, data }: SentimentBreakdownChartProps) {
  const { tickColor, gridColor } = useChartColors();

  const [topN, setTopN] = useState<string>("All")
  const sortedData = useMemo(() => {
    if (!data) return [];
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    if (topN === "All"){
      return sortedData
    }
    return sortedData.slice(0, parseInt(topN, 10));
  }, [data, topN]);

  if (isLoading) {
    return <ChartSkeleton  />;
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No participant sentiment data available.</p>
      </Card>
    );
  }

   const barHeight = 35;
   const chartHeight = Math.max(300, sortedData.length * barHeight);
  //  const viewportHeight = 300;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">Sentiment by Participant</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sentiment distribution for each participant.
          </CardDescription>
          <Select value={topN} onValueChange={setTopN}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Show All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Show All</SelectItem>
              <SelectItem value="3">Top 3</SelectItem>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="30">Top 30</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-[300px] w-full overflow-y-auto pr-4">
          <ChartContainer config={{}} style={{ height: `${chartHeight}px`}} className="w-full">
   
             <ResponsiveContainer width="100%" height={chartHeight}>
               <BarChart
                 data={sortedData}
                 layout="vertical"
                 margin={{ right: 10, left: 10}}
               >
                 <CartesianGrid stroke={gridColor} strokeOpacity={0.6} horizontal={false} />
                 <XAxis
                   type="number"
                   tick={false}
                   tickLine={false}
                   axisLine={false}
                 />
                 <YAxis
                   dataKey="name"
                   type="category"
                   tick={{ fill: tickColor, fontSize: 12 }}
                   tickLine={false}
                   axisLine={false}
                   width={130}
                   tickFormatter={(value) => value.length > 13 ? `${value.substring(0, 10)}...` : value}
                 />
                 <Tooltip
                   cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                   content={({ active, payload, label }) => {
                     if (active && payload && payload.length) {
                       const original = sortedData.find(d => d.name === label);
                       if (!original) return null;

                       return (
                         <div className="rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-sm text-xs">
                           <p className="font-bold mb-1">{label}</p>
                           <p style={{ color: 'hsl(var(--sentiment-positive))' }}>
                             Positive: {original.Positive.toLocaleString()}
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-negative))' }}>
                             Negative: {original.Negative.toLocaleString()}
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-neutral))' }}>
                             Neutral: {original.Neutral.toLocaleString()}
                           </p>
                         </div>
                       );
                     }
                     return null;
                   }}
                 />
                 <Bar dataKey="Positive" stackId="a" fill="hsl(var(--sentiment-positive))" />
                 <Bar dataKey="Negative" stackId="a" fill="hsl(var(--sentiment-negative))" />
                 <Bar dataKey="Neutral" stackId="a" fill="hsl(var(--sentiment-neutral))" radius={[0, 8, 8, 0]}/>
               </BarChart>
             </ResponsiveContainer>
           </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm h-[400px] p-4">
      <div className="space-y-1.5 mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-[calc(100%-60px)] w-full rounded-md" />
    </Card>
  );
}

export default SentimentBreakdownChart;