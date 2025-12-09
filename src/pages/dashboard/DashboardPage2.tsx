"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Upload, ShieldAlert, X, FileText, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { saveGeneralDashboardData, getAnalyticsData } from "@/utils/analyticsStore";
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
    <div className="mb-8 border-b-2 border-slate-200 pb-6 font-sans text-slate-900">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Chat Analysis Report
          </h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium text-xs uppercase tracking-wider border border-slate-200">
          Confidential
        </div>
      </div>

      
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
  const [isExporting, setIsExporting] = useState(false); 
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ participants: string[] }>({
    participants: [],
  });

  const currentChat = JSON.parse(localStorage.getItem("current_chat") || "null");
  const chatId = currentChat ? currentChat.id : undefined;

  const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

  useEffect(() => {
    const cached = getAnalyticsData();
    const chat_id_in_store = cached?.chat_id || null;
    if (chat_id_in_store && Number(chat_id_in_store) !== Number(chatId)) {
      cached.general_dashboard = null;
    }

    if (cached.general_dashboard) {
      setDashboardData(cached.general_dashboard);
      setFilterOptions({ participants: cached.general_dashboard.participants });
      setIsLoading(false);
      return; 
    }

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
    if (window.innerWidth < 768) {
      setIsFiltersOpen(false);
    }
    
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

  const handleDownloadPDF = async () => {
    if (isLoading || !dashboardData) return;
    setIsExporting(true);
    // toast.info("Generating Report...", { description: "Formatting for PDF..." });
    setTimeout(async () => {
      try {
        
        await downloadDashboardPDF(
          "pdf-export-stage", 
          `Dashboard-Analysis-Report-${new Date().toISOString().split('T')[0]}.pdf`
        );
      } catch (e) {
        console.error(e);
        toast.error("Export failed");
      } finally {
        setIsExporting(false);
      }
    }, 2500); 
  };

  return (
    <main className="flex-1 bg-background text-foreground min-h-screen relative z-0">
      <div className="relative z-10 bg-background min-h-screen"> 
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto space-y-6">
          
          {/* Header Bar */}
          <HeaderBar 
            onToggleFilters={toggleFilters} 
            isFiltersOpen={isFiltersOpen} 
            onDownload={handleDownloadPDF}
            isLoading={isExporting} 
          />

          {/* Privacy Banner */}
          <AnimatePresence>
            {showPrivacyBanner && (
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

          {/* --- DESKTOP FILTER VIEW --- */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="hidden md:block overflow-hidden" 
              >
                <FiltersCard
                  isLoading={isLoading}
                  onApplyFilters={handleApplyFilters}
                  participants={filterOptions.participants}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MOBILE FILTER DRAWER --- */}
          <AnimatePresence>
            {isFiltersOpen && (
              <div className="md:hidden relative z-50">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsFiltersOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 500 }}
                  className="fixed inset-x-0 bottom-0 bg-card border-t rounded-t-[20px] shadow-2xl flex flex-col max-h-[85vh]"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsFiltersOpen(false)}>
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                  </div>
                  <div className="overflow-y-auto p-4 pb-8">
                      <FiltersCard
                        isLoading={isLoading}
                        onApplyFilters={handleApplyFilters}
                        participants={filterOptions.participants}
                      />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

      
          <div id="dashboard-content" className="space-y-6"> 
            {/* Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <KPICardsRow isLoading={isLoading} data={dashboardData?.kpiMetrics || null} />
              </div>
              <div className="col-span-12">
                <MessagesOverTimeChart isLoading={isLoading} data={dashboardData?.messagesOverTime || null} />
              </div>
              <div className="col-span-12 lg:col-span-7">
                <ParticipantCharts isLoading={isLoading} contributionData={dashboardData?.contribution || null} activityData={dashboardData?.activity || null} />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <TimelineTable isLoading={isLoading} data={dashboardData?.timeline || null} participantCount={dashboardData?.participantCount ?? 0} />
              </div>
              <div className="col-span-12">
                <OptionalInsights isLoading={isLoading} activityByDayData={dashboardData?.activityByDay || null} hourlyActivityData={dashboardData?.hourlyActivity || null} />
              </div>
            </div>
          </div>
        </div>
        {isExporting && (
        <>
          {/* CURTAIN */}
          <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center space-y-4">
             <div className="p-4 rounded-full bg-slate-50 border border-slate-100 shadow-sm animate-pulse">
                <Loader2 className="w-10 h-10 text-[hsl(var(--mint))] animate-spin" />
             </div>
             <div className="text-center space-y-1">
               <h3 className="text-xl font-semibold text-slate-900">Generating Report</h3>
               <p className="text-slate-500 text-sm">Formatting charts for high-resolution PDF...</p>
             </div>
          </div>
        <div
            id="pdf-export-stage"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "1200px",       // FORCE DESKTOP WIDTH
              minHeight: "100vh",
              zIndex: 9998,          // Behind the curtain, but visible to browser
              backgroundColor: "#f1f5f9",
              padding: "40px",
              // FORCE LIGHT MODE VARIABLES
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
              "--radius": "0.5rem"
            } as React.CSSProperties}
            className="theme-light font-sans text-slate-900"
          >
            <ReportHeader data={dashboardData} />
            
            <div className="grid grid-cols-12 gap-6">

              <div className="col-span-12">
                <KPICardsRow isLoading={isLoading} data={dashboardData?.kpiMetrics || null} isExport={true} />
              </div>

              <div className="col-span-12">
                <MessagesOverTimeChart isLoading={isLoading} data={dashboardData?.messagesOverTime || null} isExport={true} />
              </div>

              {/* ParticipantCharts now takes all 12 columns */}
              <div className="col-span-12">
                <ParticipantCharts
                  isLoading={isLoading}
                  contributionData={dashboardData?.contribution || null}
                  activityData={dashboardData?.activity || null}
                  isExport={true}
                />
              </div>

              {/* TimelineTable now follows below, also full width */}
              <div className="col-span-12">
                <TimelineTable
                  isLoading={isLoading}
                  data={dashboardData?.timeline || null}
                  participantCount={dashboardData?.participantCount ?? 0}
                  isExport={true}
                />
              </div>

              <div className="col-span-12 grid grid-cols-1 gap-6">
                <OptionalInsights
                  isLoading={isLoading}
                  activityByDayData={dashboardData?.activityByDay || null}
                  hourlyActivityData={dashboardData?.hourlyActivity || null}
                  isExport={true}
                />
              </div>

            </div>

            
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-sm">
               Generated by SentimentScope • Page 1 of 1
            </div>
          </div>
        </>
      )}
      </div>
    </main>
  );
}

// ... EmptyDashboardState and default export remain unchanged
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