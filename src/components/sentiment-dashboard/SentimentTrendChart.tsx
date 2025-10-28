"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useTheme } from "next-themes";
// import { ChartTooltipContent } from "@/components/ui/chart"; // Use shadcn tooltip

// --- Data Structure ---
interface TrendDataPoint {
  date: string; // "YYYY-MM-DD" (or start of week/month)
  Positive: number;
  Negative: number;
  Neutral: number;
}

interface SentimentTrendChartProps {
  isLoading: boolean;
  data: TrendDataPoint[] | null;
}

// --- Helper: Theme Colors ---
// (Define or import useChartColors hook if needed for ticks/grid)
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
export function SentimentTrendChart({ isLoading, data }: SentimentTrendChartProps) {
  const { tickColor, gridColor } = useChartColors();

  // Handle Loading State
  if (isLoading) {
    return <ChartSkeleton  />;
  }

  // Handle Empty State
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No sentiment trend data for this period.</p>
      </Card>
    );
  }

  // Determine date format based on likely aggregation (simple check)
  const dateFormat = data.length > 90 ? "MMM yyyy" : data.length > 7 ? "MMM d" : "M/d";
  const tickFormatter = (dateStr: string) => format(parseISO(dateStr), dateFormat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[400px] flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">Sentiment Trend Over Time</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Evolution of sentiment distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pl-2 pr-4 h-[calc(100%-60px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} stackOffset="expand"> {/* expand scales to percentage */}
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--sentiment-positive))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--sentiment-positive))" stopOpacity={0.1}/>
                </linearGradient>
                 <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--sentiment-negative))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--sentiment-negative))" stopOpacity={0.1}/>
                </linearGradient>
                 <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--sentiment-neutral))" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="hsl(var(--sentiment-neutral))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fill: tickColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: tickColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} // Format as percentage
                domain={[0, 1]} // Ensure Y-axis is 0-1 for percentage stack
              />
              <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  content={({ active, payload, label }) => {
                     if (active && payload && payload.length) {
                       const dateLabel = format(parseISO(label), "MMM dd, yyyy");
                       return (
                         <div className="rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-sm text-xs">
                           <p className="font-bold mb-1">{dateLabel}</p>
                           {payload.map((entry) => (
                             <p key={entry.dataKey} style={{ color: entry.color }}>
                               {entry.dataKey}: {entry.payload[entry.dataKey!].toLocaleString()}
                             </p>
                           ))}
                         </div>
                       );
                     }
                     return null;
                  }}
              />
              <Area type="monotone" dataKey="Positive" stackId="1" stroke="hsl(var(--sentiment-positive))" fill="url(#positiveGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="Negative" stackId="1" stroke="hsl(var(--sentiment-negative))" fill="url(#negativeGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="Neutral" stackId="1" stroke="hsl(var(--sentiment-neutral))" fill="url(#neutralGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Reusable Skeleton ---
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
