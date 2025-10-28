"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameMonth, isSameYear } from "date-fns";
import { useTheme } from "next-themes";

// Define the type for the chart data
interface ChartData {
  date: string;
  count: number;
}

// ---FIX 1: Add isLoading to props---
interface MessagesOverTimeChartProps {
  isLoading: boolean;
  data: ChartData[] | null;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: string | number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-card/80 backdrop-blur-sm p-2 shadow-lg">
        <div className="grid grid-cols-1 gap-1">
          <div className="flex flex-col space-y-1">
            <span className="text-xs uppercase text-muted-foreground">
              {format(new Date(label || ""), 'MMM dd, yyyy')}
            </span>
            <span className="font-bold text-foreground">
              {payload[0].value.toLocaleString()} Messages
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function getChartConfig(data: ChartData[]) {
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);

  // 1. Determine Date Format
  if (isSameMonth(firstDate, lastDate) && isSameYear(firstDate, lastDate)) {
    return (date: string) => format(new Date(date), "MMM d");
  }
  if (isSameYear(firstDate, lastDate)) {
    return (date: string) => format(new Date(date), "MMM d");
  }
  return (date: string) => format(new Date(date), "yyyy - MMM");
}

// ---FIX 2: Accept isLoading in the function signature---
export function MessagesOverTimeChart({ isLoading, data }: MessagesOverTimeChartProps) {
  const { theme } = useTheme();
  const [tickColor, setTickColor] = useState("#000000");

  useEffect(() => {
    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--muted-foreground')
      .trim();
    
    setTickColor(computedColor);
  }, [theme]);

  // ---FIX 3: Check isLoading *first*---
  // This now correctly handles re-filtering
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Handle empty state (after loading)
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No message data for this period.</p>
      </Card>
    );
  }

  // Get the dynamic config for the X-axis
  const tickFormatter = getChartConfig(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[400px]">
        <CardHeader className="p-6">
          <CardTitle className="text-lg font-medium text-foreground">Messages Over Time</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Daily message count throughout the chat timeline.
          </CardDescription>
        </CardHeader>
        <div className="absolute top-4 right-6 text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <CardContent className="p-0 pl-2 pr-6 h-[calc(100%-100px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fill: tickColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: tickColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--mint))"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--mint))", stroke: "hsl(var(--card))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// A skeleton loader to provide a better loading experience
function ChartSkeleton() {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-[calc(100%-60px)] w-full mt-4 rounded-md" />
    </Card>
  );
}