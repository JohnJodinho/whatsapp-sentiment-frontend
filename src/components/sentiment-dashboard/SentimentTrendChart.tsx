"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useTheme } from "next-themes";
import type { TrendDataPoint } from "@/types/sentimentDashboardData";


interface SentimentTrendChartProps {
  isLoading: boolean;
  data: TrendDataPoint[] | null;
}

// --- Helper: Theme Colors ---
function useChartColors() {
  const { theme } = useTheme();
  const [tickColor, setTickColor] = useState("#888888");
  const [gridColor, setGridColor] = useState("rgba(15, 23, 42, 0.06)");

  useEffect(() => {
    const computedTickColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--hsl-muted-foreground").trim();
    const computedGridColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--border").trim();

    setTickColor(
      computedTickColor ? `hsl(var(${computedTickColor}))` : "hsl(var(--hsl-muted-foreground))"
    );
    setGridColor(
      computedGridColor ? `hsla(${computedGridColor}, 0.5)` : "rgba(15, 23, 42, 0.06)"
    );
  }, [theme]);

  return { tickColor, gridColor };
}

// --- Main Component ---
export function SentimentTrendChart({
  isLoading,
  data,
}: SentimentTrendChartProps) {
  const {  gridColor } = useChartColors();

  // Handle Loading State
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Handle Empty State
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">
          No sentiment trend data for this period.
        </p>
      </Card>
    );
  }

  // Determine date format
  const dateFormat =
    data.length > 90 ? "MMM yyyy" : data.length > 7 ? "MMM d" : "M/d";
  const tickFormatter = (dateStr: string) =>
    format(parseISO(dateStr), dateFormat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[400px] flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold">
            Sentiment Trend Over Time
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Evolution of sentiment distribution.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pl-2 pr-4 h-[calc(100%-60px)]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 12,
                left: 12,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--hsl-muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--hsl-muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                domain={[0, 1]}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 2 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dateLabel = format(parseISO(label), "MMM dd, yyyy");
                    return (
                      <div className="rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-sm text-xs">
                        <p className="font-bold mb-1">{dateLabel}</p>
                        {payload.map((entry) => (
                          <p
                            key={entry.dataKey}
                            style={{ color: entry.color }}
                          >
                            {entry.dataKey}:{" "}
                            {(entry.value as number).toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Sentiment Lines */}
              <Line
                type="monotone"
                dataKey="Positive"
                stroke="hsl(var(--sentiment-positive))"
                strokeWidth={2}
                dot={false}
                name="Positive"
              />
              <Line
                type="monotone"
                dataKey="Negative"
                stroke="hsl(var(--sentiment-negative))"
                strokeWidth={2}
                dot={false}
                name="Negative"
              />
              <Line
                type="monotone"
                dataKey="Neutral"
                stroke="hsl(var(--sentiment-neutral))"
                strokeWidth={2}
                dot={false}
                name="Neutral"
              />
            </LineChart>
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
