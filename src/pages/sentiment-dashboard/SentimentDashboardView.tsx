"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldAlert, X, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Components ---
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HeaderBar } from "@/components/sentiment-dashboard/HeaderBar";
import { FiltersCard } from "@/components/sentiment-dashboard/FiltersCard";

// --- Charts ---
import { SentimentKpiRow } from "@/components/sentiment-dashboard/SentimentKpiRow";
import { SentimentTrendChart } from "@/components/sentiment-dashboard/SentimentTrendChart";
import { SentimentBreakdownChart } from "@/components/sentiment-dashboard/SentimentBreakdownChart";
import { SentimentDayChart } from "@/components/sentiment-dashboard/SentimentDayChart";
import { SentimentHourChart } from "@/components/sentiment-dashboard/SentimentHourChart";
import { SentimentHighlights } from "@/components/sentiment-dashboard/SentimentHighlights";

// --- API & Utils ---
import { fetchSentimentDashboardData } from "@/lib/api/sentimentDashboardService";
import { saveSentimentDashboardData, getAnalyticsData } from "@/utils/analyticsStore";
import { downloadDashboardPDF } from "@/utils/pdfGenerator";
import type { SentimentDashboardData, SentimentFilterState } from "@/types/sentimentDashboardData";

interface SentimentDashboardViewProps {
  chatId: string;
}

/**
 * Report Header: Visible ONLY during PDF Export
 */
function ReportHeader({ data }: { data: SentimentDashboardData | null }){
  if (!data) return null;

  const score = data.kpiData?.overallScore ?? 0;
  const positive = data.kpiData?.positivePercent ?? 0;
  const negative = data.kpiData?.negativePercent ?? 0;

  // Determine tone description
  let tone = "Neutral";
  if (score > 15) tone = "Highly Positive";
  else if (score > 0) tone = "Leaning Positive";
  else if (score < -15) tone = "Highly Negative";
  else if (score < 0) tone = "Leaning Negative";

  return (
    <div className="mb-8 border-b-2 border-slate-200 pb-6 font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Sentiment Analysis Report
          </h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Generated: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Tone: <strong>{tone}</strong>
            </span>
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium text-xs uppercase tracking-wider border border-slate-200">
          Confidential
        </div>
      </div>

      {/* Executive Summary Block */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <span className="text-xs font-semibold text-slate-400 uppercase">Overall Score</span>
           <p className={`text-2xl font-bold ${score >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
             {score > 0 ? '+' : ''}{score.toFixed(1)}
           </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <span className="text-xs font-semibold text-slate-400 uppercase">Positive Vol.</span>
           <p className="text-2xl font-bold text-emerald-600">{positive.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <span className="text-xs font-semibold text-slate-400 uppercase">Negative Vol.</span>
           <p className="text-2xl font-bold text-rose-600">{negative.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

export function SentimentDashboardView({ chatId }: SentimentDashboardViewProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<SentimentDashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ participants: string[] }>({
    participants: [],
  });

  // --- UI States for Features ---
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [isExporting, setIsExporting] = useState(false); // Controls "Report Mode"

  const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

  // --- Initial Data Fetch ---
  useEffect(() => {
    // 1. Check if we have cached data in localStorage
    const cachedData = getAnalyticsData();

    if (cachedData.sentiment_dashboard) {
      // 2. If cached data exists, use it immediately
      setSentimentData(cachedData.sentiment_dashboard);
      setFilterOptions({ participants: cachedData.sentiment_dashboard.participants });
      setIsLoading(false);
    } else {
      // 3. If no cache, fetch from API
      setIsLoading(true);
      fetchSentimentDashboardData(Number(chatId))
        .then((data) => {
          setSentimentData(data);
          setFilterOptions({ participants: data.participants });
          saveSentimentDashboardData(data);
        })
        .catch((error) => {
          console.error("Failed to fetch initial sentiment data:", error);
          toast.error("Could not load sentiment data.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [chatId]);

  // --- Filter Handler ---
  const handleApplyFilters = (filters: SentimentFilterState) => {
    setIsLoading(true);
    fetchSentimentDashboardData(Number(chatId), filters)
      .then((data) => {
        setSentimentData(data);
        saveSentimentDashboardData(data);
        toast.success("Filters applied");
      })
      .catch((error) => {
        console.error("Failed to fetch filtered sentiment data:", error);
        toast.error("Failed to update dashboard.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- PDF Download Handler ---
  const handleDownloadPDF = async () => {
    if (isLoading || !sentimentData) return;

    // 1. Enter "Export Mode"
    setIsExporting(true);
    setIsFiltersOpen(false); // Close filters
    toast.info("Generating Sentiment Report...", { description: "Applying document formatting..." });

    // 2. Wait for DOM to update styles
    setTimeout(async () => {
      try {
        await downloadDashboardPDF(
          "sentiment-dashboard-content", 
          `Sentiment-Report-${new Date().toISOString().split('T')[0]}.pdf`
        );
      } catch (e) {
        console.error(e);
        toast.error("Export failed");
      } finally {
        // 3. Exit "Export Mode"
        setIsExporting(false);
      }
    }, 1000); 
  };

  return (
    <main className="flex-1 bg-background text-foreground min-h-screen">
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        
        {/* --- Header Bar (Hidden during Export) --- */}
        {!isExporting && (
          <HeaderBar 
            isFiltersOpen={isFiltersOpen} 
            onToggleFilters={toggleFilters} 
            onDownload={handleDownloadPDF}
            isLoading={isExporting}
          />
        )}

        {/* --- Privacy Banner (Hidden during Export) --- */}
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
                  Your chat data is securely processed for sentiment analysis and is <strong>automatically deleted after 4 hours</strong>.
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

        {/* --- MAIN CONTENT WRAPPER --- */}
        {/* This div is what gets captured by the PDF generator */}
        <div 
          id="sentiment-dashboard-content"
          className={cn(
            "space-y-6 transition-colors duration-300",
            // Force Light Mode styles during export
            isExporting ? "bg-white text-slate-900 p-12 theme-light" : ""
          )}
          style={isExporting ? {
            // FORCE LIGHT THEME VARIABLES
            "--background": "0 0% 100%", 
            "--foreground": "222.2 84% 4.9%",
            "--card": "0 0% 100%",
            "--card-foreground": "222.2 84% 4.9%",
            "--popover": "0 0% 100%",
            "--primary": "222.2 47.4% 11.2%",
            "--muted": "210 40% 96.1%",
            "--muted-foreground": "215.4 16.3% 46.9%",
            "--border": "214.3 31.8% 91.4%",
            // Keep sentiment colors consistent but vibrant
            "--sentiment-positive": "142.1 76.2% 36.3%",
            "--sentiment-negative": "346.8 77.2% 49.8%",
            "--sentiment-neutral": "220 13% 91%", 
          } as React.CSSProperties : {}}
        >

          {/* Report Header (Only Visible during Export) */}
          {isExporting && <ReportHeader data={sentimentData} />}

          {/* Filters (Hidden during Export) */}
          <AnimatePresence>
            {isFiltersOpen && !isExporting && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
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

          {/* --- Chart Grid --- */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* 1. KPI Row */}
            <div className="col-span-12">
              <SentimentKpiRow
                isLoading={isLoading}
                data={sentimentData?.kpiData || null}
              />
            </div>

            {/* 2. Sentiment Trend */}
            <div className="col-span-12">
              <SentimentTrendChart
                isLoading={isLoading}
                data={sentimentData?.trendData || null}
              />
            </div>

            {/* 3. Sentiment Breakdown */}
            <div className="col-span-12 lg:col-span-6">
              <SentimentBreakdownChart
                isLoading={isLoading}
                data={sentimentData?.breakdownData || null}
              />
            </div>

            {/* 4. Sentiment by Day */}
            <div className="col-span-12 lg:col-span-6">
              <SentimentDayChart
                isLoading={isLoading}
                data={sentimentData?.dayData || null}
              />
            </div>

            {/* 5. Sentiment by Hour */}
            <div className="col-span-12 lg:col-span-6">
              <SentimentHourChart
                isLoading={isLoading}
                data={sentimentData?.hourData || null}
              />
            </div>

            {/* 6. Key Highlights (Expand fully for report if needed, or keep same) */}
            <div className="col-span-12 lg:col-span-6">
               <SentimentHighlights
                  isLoading={isLoading}
                  data={sentimentData?.highlightsData || null}
               />
            </div>
          </div>

          {/* Report Footer */}
          {isExporting && (
             <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-sm">
                Generated by Sentiment Analyzer • Page 1 of 1
             </div>
          )}

        </div>
      </div>
    </main>
  );
}