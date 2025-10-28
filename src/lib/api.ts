import type { ChatRead } from "@/types/chat";
import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  getHours,
  getDay,
  format,
  eachDayOfInterval,
  getDate,
  startOfWeek,
  startOfMonth,
  eachWeekOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  type Interval
  
} from "date-fns";
import { enUS } from 'date-fns/locale';

import type { DateRange } from "react-day-picker";

// --- Import Types (Assuming types.ts contains base types like FilterState) ---
// If not, define SentimentFilterState and SentimentGranularity here
import type {
  SentimentGranularity,
  SentimentLabel,
} from "@/components/sentiment-dashboard/FiltersCard"; // Or define directly below

import type {
  DashboardData,
  FilterState,
  KpiMetric,
  MessagesOverTimeData,
  ContributionChartData,
  ActivityChartData,
  ChatSegment,
  DayData,
  HourData,
} from "@/types/dasboardData";

import type { ProgressData, ErrorData} from "@/types/sentimentProgress";

import rawData from "./mock-data.json";
// --- Import Mock Data ---
import messageSentimentsData from "@/lib/message-sentiments-mock-data-0.json";
import segmentSentimentsData from "@/lib/segment-sentiments-mock-data0.json";

// --- Type definitions for raw mock-data.json ---
interface MockMessage {
  id: number;
  sender: string;
  text: string;
  word_count: number;
  emojis_count: number;
  links_count: number;
  is_question: boolean;
  date: string; // ISO 8601 string: "2025-10-23T14:35:10"
  is_media: boolean;
}

interface MockData {
  chat_id: number;
  chat_title: string;
  messages: MockMessage[];
}


const progressIntervals: Record<string, NodeJS.Timeout> = {};


// --- Type Definitions for Mock Data ---
interface MockSentimentMessage {
  id: number;
  sender: string;
  text: string; // Used for highlights
  date: string; // ISO 8601 string
  overall_label: string; // "positive", "negative", "neutral" (lowercase)
  overall_label_score: number;
}

interface MockMessageSentimentFile {
  chat_id: string;
  chat_title: string;
  messages: MockSentimentMessage[];
}

interface MockSentimentSegment {
  id: number;
  sender: string;
  combined_text: string; // Used for highlights if granularity=segment
  date: string; // ISO 8601 string (Represents start_time)
  overall_label: string; // "positive", "negative", "neutral"
  overall_label_score: number;
}

interface MockSegmentSentimentFile {
  chat_id: string;
  chat_title: string;
  segments: MockSentimentSegment[];
}

// --- Type Definitions for Sentiment Dashboard Output ---

// Define SentimentFilterState if not imported
export interface SentimentFilterState {
  participants: string[];
  dateRange: DateRange | undefined;
  timePeriod: string;
  granularity: SentimentGranularity; // Ensure SentimentGranularity is defined/imported
  sentimentTypes: SentimentLabel[]; // Ensure SentimentLabel is defined/imported
}
// 1. KPI Row Data
export interface SentimentKpiData {
  overallScore: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  totalMessagesOrSegments: number; // Include total for context
}

// 2. Sentiment Trend Data
export interface TrendDataPoint {
  date: string; // "YYYY-MM-DD" (start of day, week, or month)
  Positive: number;
  Negative: number;
  Neutral: number;
}

// 3. Sentiment Breakdown Data
export interface BreakdownDataPoint {
  name: string; // Participant name
  Positive: number;
  Negative: number;
  Neutral: number;
  total: number;
}

// 4. Sentiment by Day Data
export interface DailySentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  score: number; // (%Pos - %Neg)
}
export type SentimentByDayData = {
  // Use lowercase keys consistent with date-fns getDay mapping
  [key in 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat']?: DailySentimentBreakdown;
};

// 5. Sentiment by Hour Data
export interface HourlySentimentBreakdown {
  hour: number; // 0-23
  Positive: number;
  Negative: number;
  Neutral: number;
  total: number;
}

// 6. Highlights Data
export interface HighlightMessage {
  id: number | string;
  sender: string;
  text: string; // Snippet
  timestamp: string; // ISO string
  score: number;
}
export interface HighlightsData {
  topPositive: HighlightMessage[];
  topNegative: HighlightMessage[];
}

// Main Contract
export interface SentimentDashboardData {
  participants: string[]; // Full list for filter
  kpiData: SentimentKpiData | null;
  trendData: TrendDataPoint[] | null;
  breakdownData: BreakdownDataPoint[] | null;
  dayData: SentimentByDayData | null;
  hourData: HourlySentimentBreakdown[] | null;
  highlightsData: HighlightsData | null;
}

// --- Helper Functions ---
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const timePeriodBuckets: Record<string, number[]> = {
  Morning: [6, 7, 8, 9, 10, 11],
  Afternoon: [12, 13, 14, 15, 16],
  Evening: [17, 18, 19, 20],
  Night: [21, 22, 23, 0, 1, 2, 3, 4, 5],
};

type DayOfWeekKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

const dayOfWeekMap: Array<DayOfWeekKey> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Helper to normalize sentiment labels (input might be lower/upper case)
const normalizeLabel = (label: string): SentimentLabel | null => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel === 'positive') return 'Positive';
  if (lowerLabel === 'negative') return 'Negative';
  if (lowerLabel === 'neutral') return 'Neutral';
  return null; // Or handle unexpected labels
}


export const uploadWhatsAppChat = (file: File): Promise<ChatRead> => {
  console.log(`Simulating upload for: ${file.name}`);
  
  return new Promise((resolve, reject) => {
    
    setTimeout(() => {
      
      if (Math.random() > 0.15) { // 85% success rate
        const chatData: ChatRead = {
          id: Math.floor(Math.random() * 1000) + 1,
          title: `Analysis of ${file.name}`.slice(0, 50),
          created_at: new Date().toISOString(),
          sentiment_status: "pending",
        };
        console.log("Simulated upload successful:", chatData);
        resolve(chatData);
      } else {
        const errorResponse = { message: "Upload failed. The server couldn't process the file." };
        console.error("Simulated upload failed.");
        reject(new Error(errorResponse.message));
      }
    }, 1500); 
  });
};


export const deleteChatMock = (chatId: number): Promise<{ message: string }> => {
  console.log(`Simulating deletion for Chat ID: ${chatId}`);

  return new Promise((resolve, reject) => {
    
    setTimeout(() => {
    
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ message: `Chat ${chatId} deleted successfully` });
      } else {
        reject(new Error("Failed to delete chat. Please try again."));
      }
    }, 1200); 
  });
};



function getDayFillColors(): Record<string, string> {
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number): string => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const baseHue = 171, baseSaturation = 79, baseLightness = 40, darkenStep = 5;
  const colors: Record<string, string> = {};
  dayOfWeekMap.forEach((day, index) => {
    const currentLightness = baseLightness - index * darkenStep;
    colors[day] = hslToHex(baseHue, baseSaturation, currentLightness);
  });
  return colors;
}
const dayColors = getDayFillColors();


/**
 * The main API function to fetch and process all dashboard data.
 */
export async function fetchDashboardData(
  filters?: FilterState
): Promise<DashboardData> {
  
  await simulateDelay(500); // Simulate network latency

  const messages = (rawData as MockData).messages;

  // 1. Get full participant list for filter dropdown (always from raw data)
  const allParticipants = [...new Set(messages.map(m => m.sender))];

  // 2. Filter Messages
  const filteredMessages = messages.filter(msg => {
    const messageDate = parseISO(msg.date);

    // Filter by Date Range
    if (filters?.dateRange?.from) {
      const { from, to } = filters.dateRange;
      const interval = { start: startOfDay(from), end: endOfDay(to || from) };
      if (!isWithinInterval(messageDate, interval)) {
        return false;
      }
    }

    // Filter by Participants
    if (filters?.participants && filters.participants.length > 0) {
      if (!filters.participants.includes(msg.sender)) {
        return false;
      }
    }

    // Filter by Time of Day
    if (filters?.timePeriod && filters.timePeriod !== "All Day") {
      const hour = getHours(messageDate);
      const bucket = timePeriodBuckets[filters.timePeriod];
      if (!bucket || !bucket.includes(hour)) {
        return false;
      }
    }
    
    return true; // Keep the message
  });
  
  // 3. Post-Filter Calculations
  const activeParticipants = [...new Set(filteredMessages.map(m => m.sender))];
  const participantCount = activeParticipants.length;

  // 4. Build DashboardData Object
  const dashboardData: DashboardData = {
    participants: allParticipants,
    participantCount: participantCount,
    
    kpiMetrics: buildKpiMetrics(filteredMessages),
    messagesOverTime: buildMessagesOverTime(filteredMessages),
    activityByDay: buildActivityByDay(filteredMessages),
    hourlyActivity: buildHourlyActivity(filteredMessages),
    
    contribution: buildContribution(
      filteredMessages,
      participantCount,
      activeParticipants,
      messages, // Pass raw messages for "Share of Voice"
      filters
    ),
    
    activity: buildActivity(filteredMessages, participantCount, activeParticipants),
    timeline: buildTimeline(filteredMessages, participantCount),
  };

  return dashboardData;
}


function buildKpiMetrics(messages: MockMessage[]): KpiMetric[] {
  // --- 1. Find Date Range ---
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  if (messages.length > 0) {
    let firstDate = parseISO(messages[0].date);
    let lastDate = parseISO(messages[0].date);

    messages.forEach(msg => {
      const msgDate = parseISO(msg.date);
      if (msgDate < firstDate) firstDate = msgDate;
      if (msgDate > lastDate) lastDate = msgDate;
    });

    minDate = startOfDay(firstDate);
    maxDate = startOfDay(lastDate);
  }

  // --- 2. Choose Aggregation Level ---
  const totalDays = minDate && maxDate ? differenceInDays(maxDate, minDate) : 0;

  let intervalIterator: (interval: Interval) => Date[];
  let periodKeyGetter: (date: Date) => string;

  if (totalDays <= 60) {
    // Daily
    intervalIterator = (interval) => eachDayOfInterval(interval);
    periodKeyGetter = (date) => format(startOfDay(date), "yyyy-MM-dd");
  } else if (totalDays <= 365) {
    // Weekly
    intervalIterator = (interval) => eachWeekOfInterval(interval, { locale: enUS });
    periodKeyGetter = (date) => format(startOfWeek(date, { locale: enUS }), "yyyy-MM-dd");
  } else {
    // Monthly
    intervalIterator = (interval) => eachMonthOfInterval(interval);
    periodKeyGetter = (date) => format(startOfMonth(date), "yyyy-MM-dd");
  }

  // --- 3. Create Maps for period stats ---
  const messagesByPeriodMap = new Map<string, number>();
  const participantsByPeriodMap = new Map<string, Set<string>>();

  messages.forEach(msg => {
    const msgDate = parseISO(msg.date);
    const periodKey = periodKeyGetter(msgDate); // Get day, week, or month key

    // A) Increment message count for "Total Messages" sparkline
    messagesByPeriodMap.set(periodKey, (messagesByPeriodMap.get(periodKey) || 0) + 1);

    // B) Add participant to the Set for "Active Participants" sparkline
    if (!participantsByPeriodMap.has(periodKey)) {
      participantsByPeriodMap.set(periodKey, new Set<string>());
    }
    participantsByPeriodMap.get(periodKey)!.add(msg.sender);
  });

  // --- 4. Build Sparkline Arrays (filling in gaps) ---
  const messagesPerDaySparkline: { v: number }[] = [];
  const participantsPerDaySparkline: { v: number }[] = [];

  if (minDate && maxDate) {
    // Iterate over the chosen interval (days, weeks, or months)
    const allPeriods = intervalIterator({ start: minDate, end: maxDate });

    allPeriods.forEach(period => {
      const periodKey = periodKeyGetter(period);

      // Add data point for "Total Messages"
      messagesPerDaySparkline.push({ v: messagesByPeriodMap.get(periodKey) || 0 });

      // Add data point for "Active Participants"
      const participantSet = participantsByPeriodMap.get(periodKey);
      participantsPerDaySparkline.push({ v: participantSet ? participantSet.size : 0 });
    });
  }

  // --- 5. Calculate Final KPI Values (These are totals, not trend-based) ---
  const totalMessages = messages.length;
  const activeParticipants = new Set(messages.map(m => m.sender)).size;
  // Active days is the number of unique days *messages were sent*
  const activeDays = new Set(messages.map(m => format(parseISO(m.date), "yyyy-MM-dd"))).size;
  const avgMessagesPerDay = activeDays > 0 ? totalMessages / activeDays : 0;

  // --- 6. Return the final array ---
  return [
    {
      label: "Total Messages",
      value: totalMessages,
      definition: "All messages sent in the filtered period.",
      sparkline: messagesPerDaySparkline // Use the new aggregated sparkline
    },
    {
      label: "Active Participants",
      value: activeParticipants,
      definition: "Unique participants who sent messages.",
      sparkline: participantsPerDaySparkline // Use the new aggregated sparkline
    },
    {
      label: "Active Days",
      value: activeDays,
      definition: "The total number of unique days with at least one message."
      // No sparkline property
    },
    {
      label: "Avg. Messages/Day",
      value: parseFloat(avgMessagesPerDay.toFixed(1)),
      definition: "The average number of messages sent per active day."
      // No sparkline property
    }
  ];
}

function buildMessagesOverTime(messages: MockMessage[]): MessagesOverTimeData[] {
  if (messages.length === 0) return [];

  // --- 1. Find True Date Range ---
  // We must iterate to find the real min/max, as messages might not be sorted.
  let minDate = parseISO(messages[0].date);
  let maxDate = parseISO(messages[0].date);

  for (const msg of messages) {
    const msgDate = parseISO(msg.date);
    if (msgDate < minDate) minDate = msgDate;
    if (msgDate > maxDate) maxDate = msgDate;
  }

  const startDate = startOfDay(minDate);
  const endDate = startOfDay(maxDate);

  // --- 2. Choose Aggregation Level ---
  const totalDays = differenceInDays(endDate, startDate);

  // Daily: 2 months or less (<= 60 days)
  if (totalDays <= 60) {
    const dailyMap = new Map<string, number>();
    messages.forEach(msg => {
      const dayKey = format(startOfDay(parseISO(msg.date)), "yyyy-MM-dd");
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
    });

    // Fill in missing days
    return eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
      const dayKey = format(day, "yyyy-MM-dd");
      return { date: dayKey, count: dailyMap.get(dayKey) || 0 };
    });
  }

  // Weekly: 2 months to 1 years (61 - 365 days)
  if (totalDays > 60 && totalDays <= 365) {
    const weeklyMap = new Map<string, number>();
    messages.forEach(msg => {
      // Group by the start of the week (e.g., Sunday)
      const weekKey = format(startOfWeek(parseISO(msg.date), { locale: enUS }), "yyyy-MM-dd");
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
    });

    // Fill in missing weeks
    return eachWeekOfInterval({ start: startDate, end: endDate }, { locale: enUS }).map(week => {
      const weekKey = format(week, "yyyy-MM-dd");
      return { date: weekKey, count: weeklyMap.get(weekKey) || 0 };
    });
  }

  // Monthly: Over 1 years (> 365 days)
  const monthlyMap = new Map<string, number>();
  messages.forEach(msg => {
    const monthKey = format(startOfMonth(parseISO(msg.date)), "yyyy-MM-dd");
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
  });

  // Fill in missing months
  return eachMonthOfInterval({ start: startDate, end: endDate }).map(month => {
    const monthKey = format(month, "yyyy-MM-dd");
    return { date: monthKey, count: monthlyMap.get(monthKey) || 0 };
  });
}

function buildActivityByDay(messages: MockMessage[]): DayData[] {
  const dayMap = new Map<string, number>();
  messages.forEach(msg => {
    const dayIndex = getDay(parseISO(msg.date)); // 0 = sun, 1 = mon...
    const dayName = dayOfWeekMap[dayIndex];
    dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
  });

  // Fill all 7 days
  return dayOfWeekMap.map(day => ({
    day: day,
    messages: dayMap.get(day) || 0,
    fill: dayColors[day]
  }));
}

function buildHourlyActivity(messages: MockMessage[]): HourData[] {
  const hourMap = new Map<number, number>();
  messages.forEach(msg => {
    const hour = getHours(parseISO(msg.date));
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  // Fill all 24 hours
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    messages: hourMap.get(i) || 0
  }));
}

function buildContribution(
  filteredMessages: MockMessage[],
  participantCount: number,
  activeParticipants: string[],
  allMessages: MockMessage[],
  filters?: FilterState
): ContributionChartData {
  
  // State 1: 1 Participant ("Share of Voice")
  if (participantCount === 1) {
    const participantName = activeParticipants[0];
    let totalMessagesInTimeRange = filteredMessages.length;
    
    // If filtered by participant, we need to get total from *all* messages in that period
    if (filters?.participants && filters.participants.length > 0) {
       totalMessagesInTimeRange = allMessages.filter(msg => {
         // Re-filter raw messages by *only* time and date
         const messageDate = parseISO(msg.date);
         if (filters?.dateRange?.from) {
           const { from, to } = filters.dateRange;
           const interval = { start: startOfDay(from), end: endOfDay(to || from) };
           if (!isWithinInterval(messageDate, interval)) return false;
         }
         if (filters?.timePeriod && filters.timePeriod !== "All Day") {
           const hour = getHours(messageDate);
           const bucket = timePeriodBuckets[filters.timePeriod];
           if (!bucket || !bucket.includes(hour)) return false;
         }
         return true;
       }).length;
    }
    
    const participantMessages = filteredMessages.length;
    const othersMessages = totalMessagesInTimeRange - participantMessages;

    return {
      type: "single",
      data: {
        name: participantName,
        percentage: (participantMessages / totalMessagesInTimeRange) * 100 || 0,
        othersPercentage: (othersMessages / totalMessagesInTimeRange) * 100 || 0
      }
    };
  }

  // State 2: 2 Participants
  if (participantCount === 2) {
    const [p1, p2] = activeParticipants;
    const counts = { [p1]: 0, [p2]: 0 };
    filteredMessages.forEach(msg => {
      counts[msg.sender]++;
    });
    return {
      type: "two",
      data: {
        participants: [
          { name: p1, messages: counts[p1] },
          { name: p2, messages: counts[p2] }
        ],
        totalMessages: filteredMessages.length
      }
    };
  }

  // State 3: Multi-participant (or 0)
  const counts = new Map<string, number>();
  filteredMessages.forEach(msg => {
    counts.set(msg.sender, (counts.get(msg.sender) || 0) + 1);
  });
  
  const sortedData = [...counts.entries()]
    .map(([name, messages]) => ({ name, messages }))
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 30); // Max 30 participants

  return {
    type: "multi",
    data: sortedData
  };
}

function buildActivity(
  messages: MockMessage[],
  participantCount: number,
  activeParticipants: string[]
): ActivityChartData | null {
  
  // 1. Only return null if there are no participants
  if (participantCount < 1) {
    return null;
  }

  let participantsToProcess: string[];

  // 2. Decide which participants to show
  if (participantCount > 3) {
    // Find the top 3 most active participants from the filtered messages
    const messageCounts = new Map<string, number>();
    messages.forEach(msg => {
      messageCounts.set(msg.sender, (messageCounts.get(msg.sender) || 0) + 1);
    });

    participantsToProcess = [...messageCounts.entries()]
      .sort((a, b) => b[1] - a[1]) // Sort by message count descending
      .slice(0, 3)                // Take the top 3
      .map(entry => entry[0]);    // Get just their names
  } else {
    // Use the 1, 2, or 3 participants as-is
    participantsToProcess = activeParticipants;
  }

  const labels = ["Text", "Media", "Links", "Questions", "Emojis"];
  
  // 3. Build stats for the selected participants (1, 2, or 3)
  const participantsData = participantsToProcess.map(name => {
    // Get messages for *this* participant only
    const participantMessages = messages.filter(m => m.sender === name);
    // Calculate their stats
    const stats = {
      text: participantMessages.filter(m => !m.is_media && m.word_count > 0).length,
      media: participantMessages.filter(m => m.is_media).length,
      links: participantMessages.reduce((sum, m) => sum + m.links_count, 0),
      questions: participantMessages.filter(m => m.is_question).length,
      emojis: participantMessages.reduce((sum, m) => sum + m.emojis_count, 0),
    };
    return {
      name: name,
      data: [stats.text, stats.media, stats.links, stats.questions, stats.emojis]
    };
  });

  return {
    labels,
    participants: participantsData
  };
}

function buildTimeline(
  messages: MockMessage[],
  participantCount: number
): ChatSegment[] {
  if (messages.length === 0) return [];

  const monthMap = new Map<string, MockMessage[]>();
  
  // Group messages by month
  messages.forEach(msg => {
    const monthKey = format(parseISO(msg.date), "MMMM yyyy");
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(msg);
  });
  
  // Process each month
  return Array.from(monthMap.entries()).map(([monthKey, monthMessages]) => {
    // Base data
    const dayCounts = new Map<number, number>();
    monthMessages.forEach(msg => {
      const day = getDate(parseISO(msg.date));
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    const peakDayEntry = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const peakDay = `${peakDayEntry[0]}${['st', 'nd', 'rd'][peakDayEntry[0] - 1] || 'th'}`; // e.g., 15th
    
    const base: ChatSegment = {
      month: monthKey,
      totalMessages: monthMessages.length,
      peakDay: peakDay,
    };

    // Add conditional data
    if (participantCount === 1) {
      return base as ChatSegment;
    } 
    
    if (participantCount === 2) {
      const [p1, p2] = [...new Set(monthMessages.map(m => m.sender))]; // Get participants for this month
      const counts = { [p1]: 0, [p2]: 0 };
      monthMessages.forEach(msg => {
        if (msg.sender === p1) counts[p1]++;
        else if (msg.sender === p2) counts[p2]++;
      });
      const total = counts[p1] + counts[p2];
      
      return {
        ...base,
        conversationBalance: {
          participantA: { name: p1, percentage: (counts[p1] / total) * 100 || 0 },
          participantB: { name: p2, percentage: (counts[p2] / total) * 100 || 0 },
        }
      } as ChatSegment;
    }
    
    // Else, multi-participant
    const monthParticipantCounts = new Map<string, number>();
    monthMessages.forEach(msg => {
      monthParticipantCounts.set(msg.sender, (monthParticipantCounts.get(msg.sender) || 0) + 1);
    });
    const mostActive = [...monthParticipantCounts.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      ...base,
      activeParticipants: monthParticipantCounts.size,
      mostActive: mostActive[0] // Name of top participant
    } as ChatSegment;
  });
}


export function simulateSentimentProgress(
  chatId: string,
  onProgress: (data: ProgressData) => void,
  onComplete: () => void,
  onError: (error: ErrorData) => void
): () => void {
  // Clear any existing interval for this chat
  if (progressIntervals[chatId]) {
    clearInterval(progressIntervals[chatId]);
  }

  let messagesDone = 0;
  let segmentsDone = 0;
  const messagesTotal = 500 + Math.floor(Math.random() * 500);
  const segmentsTotal = 50 + Math.floor(Math.random() * 50);

  const calculatePercent = () => {
    if (messagesTotal + segmentsTotal === 0) return 0;
    return Math.min(
      100,
      Math.floor(100 * (messagesDone + segmentsDone) / (messagesTotal + segmentsTotal))
    );
  };

  const cleanup = () => {
    clearInterval(progressIntervals[chatId]);
    delete progressIntervals[chatId];
  };

  const intervalId = setInterval(() => {
    try {
      // Simulate progress
      messagesDone += Math.floor(Math.random() * (messagesTotal * 0.05));
      segmentsDone += Math.floor(Math.random() * (segmentsTotal * 0.05));
      messagesDone = Math.min(messagesDone, messagesTotal);
      segmentsDone = Math.min(segmentsDone, segmentsTotal);

      const percent = calculatePercent();

      const progressData: ProgressData = {
        chat_id: chatId,
        messages_done: messagesDone,
        messages_total: messagesTotal,
        segments_done: segmentsDone,
        segments_total: segmentsTotal,
        percent,
      };

      // Safe callback execution
      try {
        onProgress(progressData);
      } catch (cbErr) {
        console.error("Progress callback failed:", cbErr);
      }

      // Simulate completion
      if (messagesDone === messagesTotal && segmentsDone === segmentsTotal) {
        cleanup();
        try {
          onComplete();
        } catch (cbErr) {
          console.error("Completion callback failed:", cbErr);
        }
      }

      // --- Optional: Simulate random error ---
      // if (percent > 30 && Math.random() < 0.05) {
      //   throw new Error("Simulated analysis failure.");
      // }

    } catch (err) {
      cleanup();
      const errorObj = {
        error: err instanceof Error ? err.message : "Unknown error occurred.",
      };
      try {
        onError(errorObj);
      } catch (cbErr) {
        console.error("Error callback failed:", cbErr);
      }
    }
  }, 750);

  progressIntervals[chatId] = intervalId;

  // Return cleanup function for manual use
  return () => {
    console.log("Cleaning up SSE simulation for chat:", chatId);
    cleanup();
  };
}


/**
 * Simulates cancelling the sentiment analysis.
 */
export async function cancelSentimentAnalysis(chatId: string): Promise<{ status: string; chat_id: string }> {
  await simulateDelay(300); // Simulate network latency

  console.log(`[API Simulation] Requesting cancellation for chat ${chatId}`);

  // In a real app, this would trigger a flag in the backend.
  // For simulation, we stop the interval if it exists.
  if (progressIntervals[chatId]) {
    clearInterval(progressIntervals[chatId]);
    delete progressIntervals[chatId];
    console.log(`[API Simulation] Stopped progress interval for chat ${chatId}`);
     // Maybe update localStorage status to 'cancelled' here?
  } else {
     console.warn(`[API Simulation] No active progress interval found for chat ${chatId} to cancel.`);
     // Optionally throw an error if cancellation is requested for a non-running job
     // throw new Error("Analysis not running or already completed.");
  }

  return { status: "cancel_requested", chat_id: chatId };
}




// --- Main Fetch Function ---
export async function fetchSentimentDashboardData(
  filters?: SentimentFilterState
): Promise<SentimentDashboardData> {

  await simulateDelay(600); // Simulate network latency

  const granularity = filters?.granularity ?? 'message'; // Default to message level
  const sourceData = granularity === 'message'
    ? (messageSentimentsData as MockMessageSentimentFile).messages
    : (segmentSentimentsData as MockSegmentSentimentFile).segments;

  // 1. Get full participant list (always from messages for consistency)
  const allParticipants = [...new Set((messageSentimentsData as MockMessageSentimentFile).messages.map(m => m.sender))];

  // 2. Filter Data based on all 5 filters
  const sentimentTypesToShow = new Set(filters?.sentimentTypes ?? ['Positive', 'Negative', 'Neutral']);

  const filteredData = sourceData.filter(item => {
    const itemDate = parseISO(item.date);
    const itemLabel = normalizeLabel(item.overall_label);

    // Filter by Date Range
    if (filters?.dateRange?.from) {
      const { from, to } = filters.dateRange;
      const interval = { start: startOfDay(from), end: endOfDay(to || from) };
      if (!isWithinInterval(itemDate, interval)) return false;
    }

    // Filter by Participants
    if (filters?.participants && filters.participants.length > 0) {
      if (!filters.participants.includes(item.sender)) return false;
    }

    // Filter by Time of Day
    if (filters?.timePeriod && filters.timePeriod !== "All Day") {
      const hour = getHours(itemDate);
      const bucket = timePeriodBuckets[filters.timePeriod];
      if (!bucket || !bucket.includes(hour)) return false;
    }

    // Filter by Sentiment Type
    if (!itemLabel || !sentimentTypesToShow.has(itemLabel)) {
      return false;
    }

    return true; // Keep the item
  });

  // 3. Build the Dashboard Data Object
  const dashboardData: SentimentDashboardData = {
    participants: allParticipants,
    kpiData: buildKpiData(filteredData),
    trendData: buildTrendData(filteredData),
    breakdownData: buildBreakdownData(filteredData),
    dayData: buildDayData(filteredData),
    hourData: buildHourData(filteredData),
    highlightsData: buildHighlightsData(filteredData),
  };

  return dashboardData;
}


// --- Data Transformation Functions for Each Visual ---

function buildKpiData(data: (MockSentimentMessage | MockSentimentSegment)[]): SentimentKpiData | null {
  if (data.length === 0) return null;

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  data.forEach(item => {
    const label = normalizeLabel(item.overall_label);
    if (label === 'Positive') positiveCount++;
    else if (label === 'Negative') negativeCount++;
    else if (label === 'Neutral') neutralCount++;
  });

  const total = data.length;
  const positivePercent = total > 0 ? (positiveCount / total) * 100 : 0;
  const negativePercent = total > 0 ? (negativeCount / total) * 100 : 0;
  const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0;
  const overallScore = positivePercent - negativePercent;

  return {
    overallScore: parseFloat(overallScore.toFixed(1)),
    positivePercent: parseFloat(positivePercent.toFixed(1)),
    negativePercent: parseFloat(negativePercent.toFixed(1)),
    neutralPercent: parseFloat(neutralPercent.toFixed(1)),
    totalMessagesOrSegments: total,
  };
}

// Uses dynamic aggregation like MessagesOverTimeChart
function buildTrendData(data: (MockSentimentMessage | MockSentimentSegment)[]): TrendDataPoint[] | null {
   if (data.length === 0) return [];

  let minDate = parseISO(data[0].date);
  let maxDate = parseISO(data[0].date);
  data.forEach(item => {
    const itemDate = parseISO(item.date);
    if (itemDate < minDate) minDate = itemDate;
    if (itemDate > maxDate) maxDate = itemDate;
  });
  const startDate = startOfDay(minDate);
  const endDate = startOfDay(maxDate);
  const totalDays = differenceInDays(endDate, startDate);

  let intervalIterator: (interval: Interval) => Date[];
  let periodKeyGetter: (date: Date) => string;
  let granularityLabel: 'day' | 'week' | 'month';

  if (totalDays <= 90) { // Daily
    intervalIterator = (interval) => eachDayOfInterval(interval);
    periodKeyGetter = (date) => format(startOfDay(date), "yyyy-MM-dd");
    granularityLabel = 'day';
  } else if (totalDays <= 730) { // Weekly
    intervalIterator = (interval) => eachWeekOfInterval(interval, { locale: enUS });
    periodKeyGetter = (date) => format(startOfWeek(date, { locale: enUS }), "yyyy-MM-dd");
    granularityLabel = 'week';
  } else { // Monthly
    intervalIterator = (interval) => eachMonthOfInterval(interval);
    periodKeyGetter = (date) => format(startOfMonth(date), "yyyy-MM-dd");
    granularityLabel = 'month';
  }

  const trendMap = new Map<string, { Positive: number; Negative: number; Neutral: number }>();

  data.forEach(item => {
    const periodKey = periodKeyGetter(parseISO(item.date));
    const label = normalizeLabel(item.overall_label);
    if (!label) return;

    if (!trendMap.has(periodKey)) {
      trendMap.set(periodKey, { Positive: 0, Negative: 0, Neutral: 0 });
    }
    const counts = trendMap.get(periodKey)!;
    counts[label]++;
  });

  // Fill gaps
  return intervalIterator({ start: startDate, end: endDate }).map(period => {
    const periodKey = periodKeyGetter(period);
    const counts = trendMap.get(periodKey) || { Positive: 0, Negative: 0, Neutral: 0 };
    return { date: periodKey, ...counts };
  });
}


function buildBreakdownData(data: (MockSentimentMessage | MockSentimentSegment)[]): BreakdownDataPoint[] | null {
   if (data.length === 0) return null;

   const breakdownMap = new Map<string, { Positive: number; Negative: number; Neutral: number; total: number }>();

   data.forEach(item => {
     const sender = item.sender;
     const label = normalizeLabel(item.overall_label);
     if (!label) return;

     if (!breakdownMap.has(sender)) {
       breakdownMap.set(sender, { Positive: 0, Negative: 0, Neutral: 0, total: 0 });
     }
     const counts = breakdownMap.get(sender)!;
     counts[label]++;
     counts.total++;
   });

   return Array.from(breakdownMap.entries()).map(([name, counts]) => ({ name, ...counts }));
}


function buildDayData(data: (MockSentimentMessage | MockSentimentSegment)[]): SentimentByDayData | null {
  if (data.length === 0) return null;

  const dayMap: Partial<Record<DayOfWeekKey, DailySentimentBreakdown>> = {}; // Use partial initially

  data.forEach(item => {
    const dayIndex = getDay(parseISO(item.date));
    const dayKey = dayOfWeekMap[dayIndex]; // Use the renamed constant
    const label = normalizeLabel(item.overall_label);
    if (!label) return;

    if (!dayMap[dayKey]) {
      dayMap[dayKey] = { positive: 0, negative: 0, neutral: 0, total: 0, score: 0 };
    }
    const counts = dayMap[dayKey]!; // Non-null assertion is safe here
    if (label === 'Positive') counts.positive++;
    else if (label === 'Negative') counts.negative++;
    else counts.neutral++;
    counts.total++;
  });

  // Calculate scores and fill missing days
  const finalDayData: SentimentByDayData = {};
  // --- FIX: Explicitly type dayKey ---
  dayOfWeekMap.forEach((dayKey: DayOfWeekKey) => {
    const counts = dayMap[dayKey] || { positive: 0, negative: 0, neutral: 0, total: 0, score: 0 };
    const posPercent = counts.total > 0 ? (counts.positive / counts.total) * 100 : 0;
    const negPercent = counts.total > 0 ? (counts.negative / counts.total) * 100 : 0;
    counts.score = parseFloat((posPercent - negPercent).toFixed(1));
    finalDayData[dayKey] = counts; // Now type-safe
  });

  return finalDayData;
}



function buildHourData(data: (MockSentimentMessage | MockSentimentSegment)[]): HourlySentimentBreakdown[] | null {
  if (data.length === 0) return null;

  const hourMap = new Map<number, { Positive: number; Negative: number; Neutral: number; total: number }>();

  data.forEach(item => {
    const hour = getHours(parseISO(item.date));
    const label = normalizeLabel(item.overall_label);
    if (!label) return;

    if (!hourMap.has(hour)) {
      hourMap.set(hour, { Positive: 0, Negative: 0, Neutral: 0, total: 0 });
    }
    const counts = hourMap.get(hour)!;
    counts[label]++;
    counts.total++;
  });

  // Fill missing hours
  return Array.from({ length: 24 }, (_, i) => {
    const counts = hourMap.get(i) || { Positive: 0, Negative: 0, Neutral: 0, total: 0 };
    return { hour: i, ...counts };
  });
}


function buildHighlightsData(data: (MockSentimentMessage | MockSentimentSegment)[]): HighlightsData | null {
   if (data.length === 0) return null;

   // Sort by score (descending for positive, ascending for negative)
   const sortedData = [...data].sort((a, b) => b.overall_label_score - a.overall_label_score);

   const topPositive = sortedData
     .filter(item => normalizeLabel(item.overall_label) === 'Positive')
     .slice(0, 5) // Get top 5
     .map(item => ({
        id: item.id,
        sender: item.sender,
        // Use 'text' if message, 'combined_text' if segment, fallback needed if structure differs
        text: (item as MockSentimentMessage).text ?? (item as MockSentimentSegment).combined_text ?? "...",
        timestamp: item.date,
        score: item.overall_label_score
     }));

    const topNegative = sortedData
     .filter(item => normalizeLabel(item.overall_label) === 'Negative')
     .reverse() // Since sorted desc, reverse to get lowest scores first
     .slice(0, 5) // Get top 5 most negative
     .map(item => ({
        id: item.id,
        sender: item.sender,
        text: (item as MockSentimentMessage).text ?? (item as MockSentimentSegment).combined_text ?? "...",
        timestamp: item.date,
        score: item.overall_label_score
     }));


   return { topPositive, topNegative };
}

// --- Placeholder for original Dashboard Data Fetch (if needed) ---
// export async function fetchDashboardData(...) {}

