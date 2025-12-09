"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameMonth, isSameYear } from "date-fns";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"; 

interface ChartData {
  date: string;
  count: number;
}

interface MessagesOverTimeChartProps {
  isLoading: boolean;
  data: ChartData[] | null;
  isExport?: boolean; // New Prop
}

// ... CustomTooltip and getChartConfig functions remain the same ...
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: string | number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-card/80 backdrop-blur-sm p-3 shadow-lg z-50">
        <div className="flex flex-col space-y-1">
          <span className="text-xs uppercase text-muted-foreground font-semibold">
            {format(new Date(label || ""), 'MMM dd, yyyy')}
          </span>
          <span className="font-bold text-foreground text-sm">
            {payload[0].value.toLocaleString()} Messages
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function getChartConfig(data: ChartData[]) {
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);

  if (isSameMonth(firstDate, lastDate) && isSameYear(firstDate, lastDate)) {
    return (date: string) => format(new Date(date), "d"); 
  }
  if (isSameYear(firstDate, lastDate)) {
    return (date: string) => format(new Date(date), "MMM d");
  }
  return (date: string) => format(new Date(date), "MMM yy");
}

export function MessagesOverTimeChart({ isLoading, data, isExport = false }: MessagesOverTimeChartProps) {
  const { theme } = useTheme();
  const [tickColor, setTickColor] = useState("#000000");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--muted-foreground')
      .trim();
    setTickColor(computedColor);
  }, [theme]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm h-[400px] p-6 flex items-center justify-center">
        <p className="text-muted-foreground">No message data for this period.</p>
      </Card>
    );
  }

  const tickFormatter = getChartConfig(data);

  // WRAPPER: If export, use standard div, else use motion.div
  const Wrapper = isExport ? 'div' : motion.div;
  const wrapperProps = isExport ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeInOut" }
  };

  return (
    // @ts-expect-error dynamic wrapper type casting
    <Wrapper {...wrapperProps}>
      <Card className={`rounded-2xl border shadow-sm relative overflow-hidden h-[400px] ${isExport ? 'border-slate-200 bg-white' : 'border-border bg-card hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300'}`}>
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-medium text-foreground">Messages Over Time</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Daily message count throughout the chat.
                </CardDescription>
            </div>
            {/* Show updated date even on PDF, it looks professional */}
            <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
              Updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 pl-0 sm:pl-2 pr-4 sm:pr-6 h-[calc(100%-85px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: tickColor, fontSize: 12 }} // Always 12px for export
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval="preserveStartEnd"
                minTickGap={30}
                dy={10}
              />
              <YAxis
                // Always show YAxis for export
                hide={isMobile && !isExport}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip 
                cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "4 4" }} 
                content={<CustomTooltip />} 
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--mint))"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--mint))", stroke: "hsl(var(--card))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Wrapper>
  );
}

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