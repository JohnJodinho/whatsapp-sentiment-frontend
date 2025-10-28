"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Removed unused imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"; // Removed unused LabelList, Legend
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";


// --- Data Structure ---
interface BreakdownDataPoint {
  name: string; // Participant name
  Positive: number;
  Negative: number;
  Neutral: number;
  total: number; // For sorting
}

interface SentimentBreakdownChartProps {
  isLoading: boolean;
  data: BreakdownDataPoint[] | null;
}

// --- Helper: Theme Colors ---
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

// --- Main Component ---
export function SentimentBreakdownChart({ isLoading, data }: SentimentBreakdownChartProps) {
  const { tickColor, gridColor } = useChartColors();

  // Sort data by total messages descending
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.total - a.total);
  }, [data]);

   // Handle Loading State
  if (isLoading) {
    return <ChartSkeleton  />;
  }

  // Handle Empty State
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No participant sentiment data available.</p>
      </Card>
    );
  }

   // Dynamic height for scrolling (similar to ContributionChart)
   const barHeight = 35; // Height per participant bar + padding
   const chartHeight = Math.max(300, sortedData.length * barHeight); // Min height 300px
   const viewportHeight = 300; // Fixed height of the scrollable area

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="rounded-2xl border bg-card shadow-sm relative overflow-hidden h-[400px] flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">Sentiment by Participant</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sentiment distribution for each participant.
          </CardDescription>
        </CardHeader>
         {/* Scrollable Content */}
        <CardContent className="flex-1 overflow-y-auto pr-4" style={{ height: `${viewportHeight}px` }}>
           <div style={{ height: `${chartHeight}px` }}> {/* Inner div sets scrollable height */}
             <ResponsiveContainer width="100%" height="100%">
               <BarChart
                 data={sortedData}
                 layout="vertical"
                 stackOffset="expand" // Stacks bars to 100%
                 margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                 <XAxis
                   type="number"
                   tick={{ fill: tickColor, fontSize: 11 }}
                   tickLine={false}
                   axisLine={false}
                   tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} // Format as percentage
                   domain={[0, 1]} // Ensure X-axis is 0-1 for percentage stack
                 />
                 <YAxis
                   dataKey="name"
                   type="category"
                   tick={{ fill: tickColor, fontSize: 11 }}
                   tickLine={false}
                   axisLine={false}
                   width={80} // Adjust width for names
                   tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value} // Truncate long names
                 />
                 <Tooltip
                   cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                   content={({ active, payload, label }) => {
                     if (active && payload && payload.length) {
                       // Find the original data point to get raw counts
                       const original = sortedData.find(d => d.name === label);
                       if (!original) return null;

                       // Safely get percentage value for a given dataKey from payload
                       const getPercent = (key: string) => {
                         type PayloadItem = { dataKey?: string | number; value?: number | string | null };
                         const items: PayloadItem[] = Array.isArray(payload) ? (payload as PayloadItem[]) : [];
                         const item = items.find((p) => String(p.dataKey) === key);
                         const val = item?.value ?? 0;
                         const num = typeof val === "number" ? val : Number(val ?? 0);
                         return `${Math.round(num * 100)}%`;
                       };

                       return (
                         <div className="rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-sm text-xs">
                           <p className="font-bold mb-1">{label}</p>
                           <p style={{ color: 'hsl(var(--sentiment-positive))' }}>
                             Positive: {original.Positive.toLocaleString()} ({getPercent('Positive')})
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-negative))' }}>
                             Negative: {original.Negative.toLocaleString()} ({getPercent('Negative')})
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-neutral))' }}>
                             Neutral: {original.Neutral.toLocaleString()} ({getPercent('Neutral')})
                           </p>
                         </div>
                       );
                     }
                     return null;
                   }}
                 />
                 {/* Legend can be added if needed */}
                 {/* <Legend /> */}
                 <Bar dataKey="Positive" stackId="a" fill="hsl(var(--sentiment-positive))" radius={[0, 4, 4, 0]} barSize={16}/>
                 <Bar dataKey="Negative" stackId="a" fill="hsl(var(--sentiment-negative))" radius={[0, 4, 4, 0]} barSize={16}/>
                 <Bar dataKey="Neutral" stackId="a" fill="hsl(var(--sentiment-neutral))" radius={[0, 4, 4, 0]} barSize={16}/>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Reusable Skeleton (can be defined once and imported)
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
