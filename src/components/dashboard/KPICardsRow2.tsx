"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the type for the new, richer metric object (trend removed)
interface Metric {
  label: string;
  value: number;
  definition: string;
  sparkline?: { v: number }[];
}

// Define props for the row component
interface KPICardsRowProps {
  isLoading: boolean;
  data: Metric[] | null;
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

// // Helper array to map skeletons
// const skeletonItems = [1, 2, 3, 4];

export function KPICardsRow({ isLoading, data }: KPICardsRowProps) {

  if (isLoading || !data) { return <KPISkeleton />;}
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {data?.map((metric) => (
            <KPI_Card key={metric.label} metric={metric} />
            
          ))
          
          }
    </motion.div>
  );
}

function KPI_Card({ metric }: { metric: Metric }) {
  return (
    <motion.div variants={itemVariants}>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          
            <Card className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-136px">
              {/* Subtle Gradient Background */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent dark:from-[hsl(var(--mint))]/20" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Top Section: Label and Sparkline */}
                <div className="flex justify-between items-start">
                  <h3 className="text-sm text-muted-foreground font-medium">{metric.label}</h3>
                  
                  {metric.sparkline && (<div className="w-24 h-10 -mr-2 -mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.sparkline || []}>
                        <defs>
                          <linearGradient id="mintSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                          labelStyle={{ display: "none" }}
                        />
                        <Line type="monotone" dataKey="v" stroke="hsl(var(--mint))" strokeWidth={2.5} fill="url(#mintSpark)" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>)}
                </div>

                {/* Bottom Section: Value (Trend Removed) */}
                <div className="mt-2">
                  <div className="text-3xl font-semibold">{metric.value.toLocaleString() ?? 0}</div>
                  {/* The trend section has been removed */}
                </div>
              </div>
            </Card>
          
        </TooltipTrigger>
        <TooltipContent>
          <p>{metric.definition ?? "No definition available."}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    </motion.div>
  );
}

// New per-card skeleton component
function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Skeleton className="h-[136px] rounded-2xl" />
      <Skeleton className="h-[136px] rounded-2xl" />
      <Skeleton className="h-[136px] rounded-2xl" />
      <Skeleton className="h-[136px] rounded-2xl" />
    </div>
  );
}