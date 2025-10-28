import type { DateRange } from "react-day-picker";

// --- Base Filter State ---
export interface FilterState {
  participants: string[];
  dateRange: DateRange | undefined;
  timePeriod: string;
}

// --- A. KPICardsRow Props ---
export interface KpiMetric {
  label: string;
  value: number;
  definition: string;
  sparkline?: { v: number }[];
}

// --- B. MessagesOverTimeChart Props ---
export interface MessagesOverTimeData {
  date: string; // "YYYY-MM-DD" format
  count: number;
}

// --- C. ParticipantCharts Props ---

// 1. For Contribution Chart (Bar/Pie)
type MultiParticipantData = { name: string; messages: number }[];

type TwoParticipantData = {
  participants: { name: string; messages: number }[];
  totalMessages: number;
};

type SingleParticipantData = {
  name: string;
  percentage: number;
  othersPercentage: number;
};

export type ContributionChartData =
  | { type: "multi"; data: MultiParticipantData }
  | { type: "two"; data: TwoParticipantData }
  | { type: "single"; data: SingleParticipantData };

// 2. For Activity Chart (Radar)
type ActivityParticipant = { name: string; data: number[] };

export type ActivityChartData = {
  labels: string[]; // e.g., ["Text", "Media", "Links"]
  participants: ActivityParticipant[];
};

// --- D. TimelineTable Props ---
export type ChatSegmentBase = {
  month: string;       // e.g., "October 2025"
  totalMessages: number;
  peakDay: string;       // e.g., "15th"
};

export type MultiParticipantSegment = ChatSegmentBase & {
  activeParticipants: number;
  mostActive: string;
};

export type TwoParticipantSegment = ChatSegmentBase & {
  conversationBalance: {
    participantA: { name: string; percentage: number };
    participantB: { name: string; percentage: number };
  };
};

export type SingleParticipantSegment = ChatSegmentBase;

export type ChatSegment =
  | MultiParticipantSegment
  | TwoParticipantSegment
  | SingleParticipantSegment;

// --- E. OptionalInsights Props ---
export interface DayData {
  day: string; // "mon", "tue", etc.
  messages: number;
  fill: string; // The hex color code, pre-calculated
}

export interface HourData {
  hour: number; // 0-23
  messages: number;
}


// --- The Main DashboardData Contract ---
export interface DashboardData {
  // For FiltersCard (and other logic)
  participants: string[];       // Full list of all participants in the chat
  participantCount: number;   // Count of *active* participants *after* filtering

  // For KPICardsRow
  kpiMetrics: KpiMetric[];

  // For MessagesOverTimeChart
  messagesOverTime: MessagesOverTimeData[];

  // For ParticipantCharts
  contribution: ContributionChartData;
  activity: ActivityChartData | null; // Null if < 1 or > 3 participants

  // For TimelineTable
  timeline: ChatSegment[];

  // For OptionalInsights
  activityByDay: DayData[];
  hourlyActivity: HourData[];
}
