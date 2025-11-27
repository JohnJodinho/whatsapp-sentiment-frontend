import type { DateRange } from "react-day-picker";

export type SentimentGranularity = "message" | "segment";
export type SentimentLabel = "Positive" | "Negative" | "Neutral";

export interface SentimentFilterState {
  participants?: string[];
  dateRange?: DateRange;
  timePeriod?: string;
  granularity: SentimentGranularity;
  sentimentTypes?: SentimentLabel[];
}


export interface SentimentKpiData {
  overallScore: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  totalMessagesOrSegments: number;
}

export interface TrendDataPoint {
  date: string; 
  Positive: number;
  Negative: number;
  Neutral: number;
}

export interface BreakdownDataPoint {
  name: string; 
  Positive: number;
  Negative: number;
  Neutral: number;
  total: number;
}

export interface DailySentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  score: number; 
}

export type SentimentByDayData = {
  [key in 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat']?: DailySentimentBreakdown;
};

export interface HourlySentimentBreakdown {
  hour: number; 
  Positive: number;
  Negative: number;
  Neutral: number;
  total: number;
}

export interface HighlightMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: string; 
  score: number;
}

export interface HighlightsData {
  topPositive: HighlightMessage[];
  topNegative: HighlightMessage[];
}

export interface SentimentDashboardData {
  participants: string[];
  kpiData: SentimentKpiData | null;
  trendData: TrendDataPoint[] | null;
  breakdownData: BreakdownDataPoint[] | null;
  dayData: SentimentByDayData | null;
  hourData: HourlySentimentBreakdown[] | null;
  highlightsData: HighlightsData | null;
}