import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Imports for Sentiment Dashboard ---
import { HeaderBar } from "@/components/sentiment-dashboard/HeaderBar";
import { FiltersCard } from "@/components/sentiment-dashboard/FiltersCard";

// --- Import Actual Sentiment Chart Components ---
import { SentimentKpiRow } from "@/components/sentiment-dashboard/SentimentKpiRow";
import { SentimentTrendChart } from "@/components/sentiment-dashboard/SentimentTrendChart";
import { SentimentBreakdownChart } from "@/components/sentiment-dashboard/SentimentBreakdownChart";
import { SentimentDayChart } from "@/components/sentiment-dashboard/SentimentDayChart";
import { SentimentHourChart } from "@/components/sentiment-dashboard/SentimentHourChart";
import { SentimentHighlights } from "@/components/sentiment-dashboard/SentimentHighlights";

// --- Import Sentiment API function and Data Types ---
import { fetchSentimentDashboardData } from "@/lib/api/sentimentDashboardService";
// Assuming SentimentDashboardData is defined in types.ts or api.ts
// It should contain fields like: participants, kpiData, trendData, breakdownData, dayData, hourData, highlightsData
import type { SentimentDashboardData, SentimentFilterState } from "@/types/sentimentDashboardData";
import { saveSentimentDashboardData } from "@/utils/analyticsStore";

interface SentimentDashboardViewProps {
  chatId: string; // Keep chatId if needed for API calls, though mock doesn't use it
}

export function SentimentDashboardView({ chatId }: SentimentDashboardViewProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<SentimentDashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ participants: string[] }>({
    participants: [],
  });

  const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

  // --- Initial Data Fetch ---
  useEffect(() => {
    setIsLoading(true);
    // --- Use Actual API Call ---
    fetchSentimentDashboardData(Number(chatId)) // Pass chatId if your API needs it
      .then((data) => {
        setSentimentData(data);
        setFilterOptions({ participants: data.participants }); // Get participants from data
        console.log("[Sentiment View] Initial data received:", data);
        saveSentimentDashboardData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch initial sentiment data:", error);
        // Add user-facing error handling (e.g., toast)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [chatId]); // Refetch if chatId changes

  // --- Filter Handler ---
  const handleApplyFilters = (filters: SentimentFilterState) => {
    setIsLoading(true);
    // --- Use Actual API Call ---
    fetchSentimentDashboardData(Number(chatId), filters) // Pass chatId if needed
      .then((data) => {
        setSentimentData(data);
        // Participants list (filterOptions) usually stays the same after initial load
        console.log("[Sentiment View] Filtered data received:", data);
        saveSentimentDashboardData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch filtered sentiment data:", error);
         // Add user-facing error handling (e.g., toast)
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* --- Header Bar Integration --- */}
        <HeaderBar isFiltersOpen={isFiltersOpen} onToggleFilters={toggleFilters} />

        {/* --- Animated Filters Card Integration --- */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <FiltersCard
                isLoading={isLoading}
                onApplyFilters={handleApplyFilters}
                participants={filterOptions.participants} // Pass participants for the dropdown
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Chart Grid --- */}
        <div className="grid grid-cols-12 gap-6">
          {/* 1. KPI Row (Spans full width) */}
          <div className="col-span-12">
            <SentimentKpiRow
              isLoading={isLoading}
              data={sentimentData?.kpiData || null}
            />
          </div>

          {/* 2. Sentiment Trend (Spans half width on large screens) */}
          <div className="col-span-12">
            <SentimentTrendChart
              isLoading={isLoading}
              data={sentimentData?.trendData || null}
            />
          </div>

          {/* 3. Sentiment Breakdown (Spans half width on large screens) */}
          <div className="col-span-12 lg:col-span-6">
            <SentimentBreakdownChart
              isLoading={isLoading}
              data={sentimentData?.breakdownData || null}
            />
          </div>

          {/* 4. Sentiment by Day (Spans quarter width on large screens) */}
          <div className="col-span-12 lg:col-span-6">
            <SentimentDayChart
              isLoading={isLoading}
              data={sentimentData?.dayData || null}
            />
          </div>

          {/* 5. Sentiment by Hour (Spans quarter width on large screens) */}
          <div className="col-span-12 lg:col-span-6">
            <SentimentHourChart
              isLoading={isLoading}
              data={sentimentData?.hourData || null}
            />
          </div>

          {/* 6. Key Highlights (Spans half width on large screens) */}
          <div className="col-span-12 lg:col-span-6">
             <SentimentHighlights
                isLoading={isLoading}
                data={sentimentData?.highlightsData || null}
             />
          </div>
        </div>
      </div>
    </main>
  );
}

