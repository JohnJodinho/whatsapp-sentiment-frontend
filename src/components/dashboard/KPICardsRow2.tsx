"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Metric {
  label: string;
  value: number;
  definition: string;
  sparkline?: { v: number }[];
}

interface KPICardsRowProps {
  isLoading: boolean;
  data: Metric[] | null;
  isExport?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function KPICardsRow({ isLoading, data, isExport = false }: KPICardsRowProps) {
  if (isLoading || !data) { return <KPISkeleton />;}
  if (isExport) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {data.map((metric) => (
          <KPI_Card key={metric.label} metric={metric} isExport={true} />
        ))}
      </div>
    );
  }
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {data?.map((metric) => (
            <KPI_Card key={metric.label} metric={metric} />
      ))}
    </motion.div>
  );
}

function KPI_Card({ metric, isExport = false }: { metric: Metric, isExport?: boolean }) {
  
  // Style Logic:
  // Normal: hover effects, shadow-sm
  // Export: No hover, No shadow, Border visible (slate-200), Background White
  const cardClasses = isExport
    ? "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 h-[136px]"
    : "relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[136px]";

  const CardBody = (
    <Card className={cardClasses}>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent dark:from-[hsl(var(--mint))]/20" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-muted-foreground font-medium truncate pr-2">{metric.label}</h3>
          {metric.sparkline && (
            <div className="w-20 h-10 -mr-2 -mt-2 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.sparkline || []}>
                  <defs>
                    <linearGradient id="mintSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--mint))" strokeWidth={2} fill="url(#mintSpark)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-1">
          <div className="text-3xl font-semibold tracking-tight">{metric.value.toLocaleString() ?? 0}</div>
        </div>
      </div>
    </Card>
  );

  if (isExport) return CardBody;

  return (
    <motion.div variants={itemVariants}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{CardBody}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[200px]">{metric.definition ?? "No definition available."}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[136px] rounded-2xl" />)}
    </div>
  );
}