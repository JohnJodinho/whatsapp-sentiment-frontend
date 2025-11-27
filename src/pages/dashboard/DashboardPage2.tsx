"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Upload, ShieldAlert, X, FileText, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Components
import { Button } from "@/components/ui/button";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { FiltersCard, type FilterState } from "@/components/dashboard/FiltersCard2";
import { KPICardsRow } from "@/components/dashboard/KPICardsRow2";
import { MessagesOverTimeChart } from "@/components/dashboard/MessagesOverTimeChart2";
import { ParticipantCharts } from "@/components/dashboard/ParticipantCharts2";
import { TimelineTable } from "@/components/dashboard/TimelineTable2";
import { OptionalInsights } from "@/components/dashboard/OptionalInsights2";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Utils & API
import { fetchDashboardData } from "@/lib/api/dashboardService";
import { saveGeneralDashboardData } from "@/utils/analyticsStore";
import { downloadDashboardPDF } from "@/utils/pdfGenerator"; 
import type { DashboardData } from "@/types/dasboardData";

const CHAT_STORAGE_KEY = "current_chat";

/**
 * Helper component for the Report Header (Visible only in PDF)
 */
function ReportHeader({ data }: { data: DashboardData | null }) {
  if (!data) return null;
  
  const totalMessages = data.kpiMetrics?.find(m => m.label === "Total Messages")?.value ?? 0;
  const activeDays = data.kpiMetrics?.find(m => m.label === "Active Days")?.value ?? 0;
  
  return (
    <div className="mb-8 border-b-2 border-slate-200 pb-6 font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Chat Analysis Report
          </h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Generated: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Source: Chat Upload
            </span>
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium text-xs uppercase tracking-wider border border-slate-200">
          Confidential
        </div>
      </div>

      {/* Text Summary Section - The "Info" the user wanted */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-700 space-y-2">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Executive Summary
        </h3>
        <p className="leading-relaxed text-sm">
          This report analyzes the communication patterns of <strong>{data.participantCount} participants</strong>. 
          The conversation spans <strong>{activeDays} active days</strong> with a total volume of <strong>{totalMessages.toLocaleString()} messages</strong>.
          The data below visualizes engagement trends, participant contributions, and peak activity times to provide a comprehensive overview of the group's dynamics.
        </p>
      </div>
    </div>
  );
}

function DashboardView() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- New State: Controls "Report Mode" ---
  const [isExporting, setIsExporting] = useState(false); 
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ participants: string[] }>({
    participants: [],
  });

  const currentChat = JSON.parse(localStorage.getItem("current_chat") || "null");
  const chatId = currentChat ? currentChat.id : undefined;

  const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

  // --- Initial Data Fetch ---
  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData(chatId)
      .then((data) => {
        setDashboardData(data);
        setFilterOptions({ participants: data.participants });
        saveGeneralDashboardData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch initial dashboard data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [chatId]);

  const handleApplyFilters = (filters: FilterState) => {
    setIsLoading(true);
    fetchDashboardData(chatId, filters)
      .then((data) => {
        setDashboardData(data);
        saveGeneralDashboardData(data);
        toast.success("Filters applied successfully");
      })
      .catch((error) => {
        console.error("Failed to fetch filtered dashboard data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- PDF Download Logic ---
  const handleDownloadPDF = async () => {
    if (isLoading || !dashboardData) return;

    // 1. Enter "Export Mode"
    setIsExporting(true);
    setIsFiltersOpen(false); // Close filters for clean shot
    toast.info("Generating Report...", { description: "Applying document formatting..." });

    // 2. Wait 1 second for the DOM to update styles (Dark -> Light)
    setTimeout(async () => {
      try {
        await downloadDashboardPDF(
          "dashboard-content", 
          `Analysis-Report-${new Date().toISOString().split('T')[0]}.pdf`
        );
      } catch (e) {
        console.error(e);
        toast.error("Export failed");
      } finally {
        // 3. Exit "Export Mode" (Return to normal Dashboard)
        setIsExporting(false);
      }
    }, 1000); 
  };

  return (
    <main className="flex-1 bg-background text-foreground min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Bar - Hidden during export to avoid duplication with ReportHeader */}
        {!isExporting && (
          <HeaderBar 
            onToggleFilters={toggleFilters} 
            isFiltersOpen={isFiltersOpen} 
            onDownload={handleDownloadPDF}
            isLoading={isExporting} 
          />
        )}

        {/* Privacy Banner - Hidden during export */}
        <AnimatePresence>
          {showPrivacyBanner && !isExporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 relative pr-10 rounded-xl">
                <ShieldAlert className="h-4 w-4 stroke-blue-600 dark:stroke-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300 font-semibold">Data Retention Policy</AlertTitle>
                <AlertDescription className="text-sm opacity-90">
                  Your chat data is securely processed for analysis and is <strong>automatically deleted after 4 hours</strong>.
                </AlertDescription>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 text-blue-500 rounded-full"
                  onClick={() => setShowPrivacyBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- REPORT WRAPPER --- */}
        {/* We use a style block to force CSS variables to LIGHT mode values during export */}
        <div 
          id="dashboard-content" 
          className={cn(
            "space-y-6 transition-colors duration-300",
            // If exporting: Force white bg, black text, and add paper-like padding
            isExporting ? "bg-white text-slate-900 p-12 theme-light" : ""
          )}
          style={isExporting ? {
            // FORCE LIGHT THEME VARIABLES (Adjust these hex codes to match your tailwind light theme)
            "--background": "0 0% 100%", 
            "--foreground": "222.2 84% 4.9%",
            "--card": "0 0% 100%",
            "--card-foreground": "222.2 84% 4.9%",
            "--popover": "0 0% 100%",
            "--popover-foreground": "222.2 84% 4.9%",
            "--primary": "222.2 47.4% 11.2%",
            "--primary-foreground": "210 40% 98%",
            "--muted": "210 40% 96.1%",
            "--muted-foreground": "215.4 16.3% 46.9%",
            "--border": "214.3 31.8% 91.4%",
          } as React.CSSProperties : {}}
        > 
          
          {/* Inject Header only during Export */}
          {isExporting && <ReportHeader data={dashboardData} />}

          {/* Filters - Hidden during export */}
          <AnimatePresence>
            {isFiltersOpen && !isExporting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden" 
              >
                <FiltersCard
                  isLoading={isLoading}
                  onApplyFilters={handleApplyFilters}
                  participants={filterOptions.participants}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MAIN CONTENT --- */}
          {/* Note: We force specific grid/spacing for the printed report if needed */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <KPICardsRow
                isLoading={isLoading}
                data={dashboardData?.kpiMetrics || null}
              />
            </div>

            <div className="col-span-12">
              <MessagesOverTimeChart
                isLoading={isLoading}
                data={dashboardData?.messagesOverTime || null}
              />
            </div>

            <div className="col-span-12 lg:col-span-7">
              <ParticipantCharts
                isLoading={isLoading}
                contributionData={dashboardData?.contribution || null}
                activityData={dashboardData?.activity || null}
              />
            </div>

            <div className="col-span-12 lg:col-span-5">
              <TimelineTable
                isLoading={isLoading}
                data={dashboardData?.timeline || null}
                participantCount={dashboardData?.participantCount ?? 0}
              />
            </div>

            {/* Always expand Insights for the report */}
            <div className="col-span-12">
              {isExporting ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 page-break-inside-avoid">
                    <OptionalInsights
                      isLoading={isLoading}
                      activityByDayData={dashboardData?.activityByDay || null}
                      hourlyActivityData={dashboardData?.hourlyActivity || null}
                    />
                 </div>
              ) : (
                <OptionalInsights
                  isLoading={isLoading}
                  activityByDayData={dashboardData?.activityByDay || null}
                  hourlyActivityData={dashboardData?.hourlyActivity || null}
                />
              )}
            </div>
          </div>
          
          {/* Report Footer */}
          {isExporting && (
             <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-sm">
                Generated by Chat Analyzer • Page 1 of 1
             </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ... (EmptyDashboardState and default export remain the same)
// Just make sure to export DashboardPage as before

function EmptyDashboardState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background text-center space-y-6 px-6">
      <FolderOpen className="w-20 h-20 text-muted-foreground/70" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">No Chat Uploaded Yet</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Upload a chat on the Upload page to generate insights.
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

export default function DashboardPage() {
  const [hasUploadedChat, setHasUploadedChat] = useState<boolean>(() => {
    return localStorage.getItem(CHAT_STORAGE_KEY) !== null;
  });

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_STORAGE_KEY) {
        setHasUploadedChat(event.newValue !== null);
      }
    };
    const handleChatUpdate = () => {
      setHasUploadedChat(localStorage.getItem(CHAT_STORAGE_KEY) !== null);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chat-updated", handleChatUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chat-updated", handleChatUpdate);
    };
  }, []);
  return <>{hasUploadedChat ? <DashboardView /> : <EmptyDashboardState />}</>;
}