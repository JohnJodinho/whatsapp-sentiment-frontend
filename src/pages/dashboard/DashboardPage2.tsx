import { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload } from "lucide-react";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { FiltersCard, type FilterState } from "@/components/dashboard/FiltersCard2";
import { KPICardsRow } from "@/components/dashboard/KPICardsRow2";
import { MessagesOverTimeChart } from "@/components/dashboard/MessagesOverTimeChart2";
import { ParticipantCharts } from "@/components/dashboard/ParticipantCharts2";
import { TimelineTable } from "@/components/dashboard/TimelineTable2";
import { OptionalInsights } from "@/components/dashboard/OptionalInsights2";

// Import the API function and data types
import { fetchDashboardData } from "@/lib/api";
import type { DashboardData } from "@/types/dasboardData";

/**
 * The main active dashboard view with a responsive, full-width grid layout.
 * This is now the "Brain" component.
 */
function DashboardView() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // --- New State ---
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // State to hold the participant list for the filter dropdown
  const [filterOptions, setFilterOptions] = useState<{ participants: string[] }>({
    participants: [],
  });

  const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

  // --- Initial Data Fetch ---
  useEffect(() => {
    setIsLoading(true);
    // Fetch with no filters on initial mount
    fetchDashboardData()
      .then((data) => {
        setDashboardData(data);
        // Set the participant list for the filter card
        setFilterOptions({ participants: data.participants });
      })
      .catch((error) => {
        console.error("Failed to fetch initial dashboard data:", error);
        // You could show a global toast error here
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once

  // --- Filter Handler ---
  const handleApplyFilters = (filters: FilterState) => {
    setIsLoading(true);
    // Fetch *with* the filters object
    fetchDashboardData(filters)
      .then((data) => {
        setDashboardData(data);
        // We don't update filterOptions here, as the participant list is constant
      })
      .catch((error) => {
        console.error("Failed to fetch filtered dashboard data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Bar */}
        <HeaderBar onToggleFilters={toggleFilters} isFiltersOpen={isFiltersOpen} />

        {/* Animated Filters Card */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Pass props to FiltersCard */}
              <FiltersCard
                isLoading={isLoading}
                onApplyFilters={handleApplyFilters}
                participants={filterOptions.participants}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid for charts and tables */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards */}
          <div className="col-span-12">
            <KPICardsRow
              isLoading={isLoading}
              data={dashboardData?.kpiMetrics || null}
            />
          </div>

          {/* Messages Over Time */}
          <div className="col-span-12">
            <MessagesOverTimeChart
              isLoading={isLoading}
              data={dashboardData?.messagesOverTime || null}
            />
          </div>

          {/* Participant Charts (Contribution & Activity) */}
          <div className="col-span-12 lg:col-span-7">
            <ParticipantCharts
              isLoading={isLoading}
              contributionData={dashboardData?.contribution || null}
              activityData={dashboardData?.activity || null}
            />
          </div>

          {/* Timeline Table */}
          <div className="col-span-12 lg:col-span-5">
            <TimelineTable
              isLoading={isLoading}
              data={dashboardData?.timeline || null}
              // Pass participantCount *after* filtering
              participantCount={dashboardData?.participantCount ?? 0}
            />
          </div>

          {/* Optional Insights (Collapsible) */}
          <div className="col-span-12">
            <OptionalInsights
              isLoading={isLoading}
              activityByDayData={dashboardData?.activityByDay || null}
              hourlyActivityData={dashboardData?.hourlyActivity || null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Renders the empty state for the dashboard when no chat is uploaded.
 */
function EmptyDashboardState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background text-center space-y-6 px-6">
      <FolderOpen className="w-20 h-20 text-muted-foreground/70" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          No Chat Uploaded Yet
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Upload a chat on the Upload page to generate insights and view your
          personalized analysis dashboard.
        </p>
      </div>
      <Button
        onClick={() => navigate("/upload")}
        className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] hover:shadow-lg hover:scale-105 transition-transform duration-300"
      >
        <Upload className="w-4 h-4 mr-2" />
        Go to Upload Page
      </Button>
    </div>
  );
}

/**
 * The main dashboard page. It determines whether to show the empty
 * state or the full dashboard based on the chat upload status.
 */
export default function DashboardPage() {
  // Logic to check if chat data exists in localStorage
  const hasUploadedChat = localStorage.getItem("current_chat") !== null;

  return <>{hasUploadedChat ? <DashboardView /> : <EmptyDashboardState />}</>;
}