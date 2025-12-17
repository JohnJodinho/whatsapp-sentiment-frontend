"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import type { HourlySentimentBreakdown } from "@/types/sentimentDashboardData";

interface SentimentHourChartProps {
  isLoading: boolean;
  data: HourlySentimentBreakdown[] | null; // Expects array of 24 objects
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
export function SentimentHourChart({ isLoading, data }: SentimentHourChartProps) {
  const { gridColor } = useChartColors();

  // Handle Loading State
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Handle Empty State
  if (!data || data.length === 0 || data.every(d => d.total === 0)) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">No hourly sentiment data available.</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[350px] flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">Sentiment by Hour</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Distribution of sentiment across the day.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pl-2 pr-4 h-[calc(100%-60px)]">
           {/* --- MOBILE FIX START --- */}
           <div className="w-full h-full overflow-x-auto pb-2">
             <div className="h-full min-w-[800px] md:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "hsl(var(--hsl-muted-foreground))", fontSize: 10 }}
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                      interval={2} // Force show all ticks when scrolling
                    />
                    <YAxis type="number" tick={false} tickLine={false} axisLine={false} domain={[0, 1]} />
              <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.05 }}
                   content={({ active, payload, label }) => {
                     if (active && payload && payload.length) {
                       const hourLabel = `${label}:00 - ${parseInt(label, 10) + 1}:00`;
                       // Find original data point
                       const original = data.find(d => d.hour === parseInt(label, 10));
                       if (!original) return null;
                        // Safely get percentage value for a given dataKey from payload
                       const getPercent = (key: string) => {
                        type PayloadItem = { dataKey?: string | number; value?: number | string | null };
                        const items: PayloadItem[] = Array.isArray(payload) ? (payload as PayloadItem[]) : [];
                        const item = items.find((p) => String(p.dataKey) === key);
                        const val = item?.value ?? 0;
                        const count = typeof val === "number" ? val : Number(val ?? 0);
                        
                        // Calculate percentage based on total
                        const percentage = original.total > 0 ? (count / original.total) * 100 : 0;
                        return `${Math.round(percentage)}%`;
                      };
                       return (
                         <div className="rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-sm text-xs">
                           <p className="font-bold mb-1">{hourLabel}</p>
                           <p style={{ color: 'hsl(var(--sentiment-positive))' }}>
                             Positive: {original.Positive.toLocaleString()} ({getPercent("Positive")})
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-negative))' }}>
                             Negative: {original.Negative.toLocaleString()} ({getPercent("Negative")})
                           </p>
                            <p style={{ color: 'hsl(var(--sentiment-neutral))' }}>
                             Neutral: {original.Neutral.toLocaleString()} ({getPercent("Neutral")})
                           </p>
                         </div>
                       );
                     }
                     return null;
                   }}
              />
              <Bar dataKey="Positive" stackId="a" fill="hsl(var(--sentiment-positive))" barSize={20} radius={[0, 0, 1, 1]} />
                    <Bar dataKey="Negative" stackId="a" fill="hsl(var(--sentiment-negative))" barSize={20} radius={[0, 0, 1, 1]} />
                    <Bar dataKey="Neutral" stackId="a" fill="hsl(var(--sentiment-neutral))" barSize={20} radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
          {/* --- MOBILE FIX END --- */}
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
