"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer, // Import ResponsiveContainer
  Label

} from "recharts";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
// <-- Add Info
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { SentimentKpiData } from "@/types/sentimentDashboardData";

interface SentimentKpiRowProps {
  isLoading: boolean;
  data: SentimentKpiData | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};
// --- 2. Main Row Component ---
export function SentimentKpiRow({ isLoading, data }: SentimentKpiRowProps) {
  // Render skeletons if loading or no data
  if (isLoading || !data) {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <KpiCardSkeleton />
        <GaugeSkeleton />
        <GaugeSkeleton />
        <GaugeSkeleton />
      </motion.div>
    );
  }

  // Render actual KPIs
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <TooltipProvider><OverallScoreCard score={data.overallScore} /></TooltipProvider>
      <SentimentGaugeCard
        label="Positive Sentiment"
        percentage={data.positivePercent}
        color="var(--sentiment-positive)" // Use CSS variable name
      />
      <SentimentGaugeCard
        label="Negative Sentiment"
        percentage={data.negativePercent}
        color="var(--sentiment-negative)" // Use CSS variable name
      />
      <SentimentGaugeCard
        label="Neutral Sentiment"
        percentage={data.neutralPercent}
        color="var(--sentiment-neutral)" // Use CSS variable name
      />
    </div>
  );
}

// --- 3. Sub-Component: Overall Score Card ---
// --- 3. Sub-Component: Overall Score Card ---
function OverallScoreCard({ score }: { score: number }) {
  
  const scoreColor = score > 0 ? "text-emerald-500" : score < 0 ? "text-red-500" : "text-muted-foreground";
  const ScoreIcon = score > 0 ? TrendingUp : score < 0 ? TrendingDown : Minus;

  return (
    <motion.div variants={itemVariants}>
      {/* CHANGED: Set consistent height and flex-col for proper content filling */}
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[230px] flex flex-col">
       <div className="absolute inset-0 z-0 bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent dark:from-[hsl(var(--mint))]/20" /> 
        {/* REMOVED: Redundant 1px empty div */}

        <div className="relative z-10">
          {/* CHANGED: Used CardHeader/CardTitle for better structure */}
          <CardHeader className="p-0 items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
            Overall Sentiment Score
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This score is calculated by: (% Positive - % Negative)</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
              </div>
              {/* CHANGED: flex-1, justify-center, and items-center now correctly work */}
          <CardContent className="relative z-10 p-0 flex flex-col items-center justify-center flex-1">
          <div className={`text-4xl font-bold ${scoreColor} flex items-center`}>
            <ScoreIcon className="h-7 w-7 mr-2" />
            {score.toFixed(1)}
          </div>
          <p className="text-xs mt-1 text-muted-foreground">
            (% Positive - % Negative)
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

 
// --- Props ---
interface SentimentGaugeCardProps {
  label: string;
  percentage: number;
  color: string; // CSS variable name like 'var(--sentiment-positive)'
}

// --- Gauge Component ---
// --- Gauge Component ---
function SentimentGaugeCard({ label, percentage, color }: SentimentGaugeCardProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const data = [
    {
      name: label,
      value: clampedPercentage,
      rest: Math.max(0, 100 - clampedPercentage),
    },
  ];

  const chartConfig = {
    value: {
      label: label,
      color: `hsl(${color})`,
    },
    rest: {
      label: "Others",
      color: "hsl(var(--hsl-card))",
    },
  } satisfies ChartConfig;

  return (
    <motion.div variants={itemVariants}>
      {/* Added motion.div wrapper for consistency */}
      <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[230px] flex flex-col">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent dark:from-[hsl(var(--mint))]/20" />

        {/* Header */}
        <div className="relative z-10">
          <CardHeader className="p-0 items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
          </CardHeader>
        </div>

        {/* Chart Section */}
        <CardContent className="relative z-10 p-0 flex-1 flex justify-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={data}
                startAngle={180}
                endAngle={0}
                innerRadius="90%"
                outerRadius="130%"
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      // formatter={(value) => `${Number(value).toFixed(0)}%`}
                      // indicator="line"
                      // nameKey="value"
                    />
                  }
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 13}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan className="fill-foreground text-2xl font-bold">
                              {clampedPercentage.toFixed(0)}%
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </PolarRadiusAxis>
                 {/* Value Bar */}
                <RadialBar
                  dataKey="value"
                  fill={`hsl(${color})`}
                  stackId="a"
                  cornerRadius={2}
                  className="stroke-transparent stroke-2"
                  isAnimationActive={false}
                />

                {/* Background Bar (rest) */}
                <RadialBar
                  dataKey="rest"
                  stackId="a"
                  cornerRadius={2}
                  fill="hsl(var(--hsl-card))"
                  className="stroke-transparent stroke-2"
                  isAnimationActive={false}
                />

               
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}


// --- 5. Skeleton Components ---
function KpiCardSkeleton() {
  return (
    <Card className="rounded-2xl border bg-card p-4 h-[180px]">
      <Skeleton className="h-4 w-3/5 mb-2" />
      <div className="flex flex-col items-center justify-center flex-1 mt-2">
        <Skeleton className="h-10 w-2/5 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}

function GaugeSkeleton() {
  return (
    <Card className="rounded-2xl border bg-card p-4 h-[180px]">
      <Skeleton className="h-4 w-4/5 mb-2 mx-auto" /> {/* Centered title skeleton */}
      <div className="flex items-end justify-center flex-1 mt-1 relative"> {/* Use flex-end to push semi-circle down */}
         {/* Simulate Semi-Circle */}
         <Skeleton className="h-[50px] w-[100px] rounded-t-full rounded-b-none" />
          {/* Simulate Center Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
             <Skeleton className="h-6 w-10" />
          </div>
      </div>
    </Card>
  );
}