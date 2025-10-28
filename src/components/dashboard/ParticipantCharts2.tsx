"use client";

import { motion } from "framer-motion";
import { ContributionChart, type ContributionChartData } from "@/components/dashboard/ContributionChart"
import { ActivityChart, type ActivityChartData } from "@/components/dashboard/ActivityChart"; // Adjust paths

// --- MAIN PROPS (from prompt) ---
interface ParticipantChartsProps {
  contributionData: ContributionChartData | null; // Made nullable to handle null from parent
  activityData: ActivityChartData | null; // Made nullable to handle null from parent
  isLoading: boolean;
}

// Main component that renders the two charts in a grid
export function ParticipantCharts({ contributionData, activityData, isLoading }: ParticipantChartsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
    >
      <ContributionChart isLoading={isLoading} data={contributionData} />
      <ActivityChart isLoading={isLoading} data={activityData} />
    </motion.div>
  );
}