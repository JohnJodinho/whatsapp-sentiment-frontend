"use client";

import { motion } from "framer-motion";
import { ContributionChart, type ContributionChartData } from "@/components/dashboard/ContributionChart"
import { ActivityChart, type ActivityChartData } from "@/components/dashboard/ActivityChart"; 

interface ParticipantChartsProps {
  contributionData: ContributionChartData | null;
  activityData: ActivityChartData | null;
  isLoading: boolean;
  isExport?: boolean; // NEW PROP
}

export function ParticipantCharts({ contributionData, activityData, isLoading, isExport = false }: ParticipantChartsProps) {
  return (
    <motion.div
      className={
        isExport
          ? "grid grid-cols-2 gap-6"          // always side-by-side when exporting
          : "grid grid-cols-1 lg:grid-cols-2 gap-6" // normal responsive behavior
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
    >
      <ContributionChart isLoading={isLoading} data={contributionData} isExport={isExport} />
      <ActivityChart isLoading={isLoading} data={activityData} isExport={isExport} />
    </motion.div>
  );
}