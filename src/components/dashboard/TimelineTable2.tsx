"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MultiParticipantSegment, TwoParticipantSegment,  ChatSegment } from "@/types/dasboardData";


interface TimelineTableProps {
  isLoading: boolean;
  data: ChatSegment[] | null;
  participantCount: number; // Used to determine mode, even when loading
}

// 3. Type guard functions
function isMulti(seg: ChatSegment): seg is MultiParticipantSegment {
  return (seg as MultiParticipantSegment).mostActive !== undefined;
}
function isTwo(seg: ChatSegment): seg is TwoParticipantSegment {
  return (seg as TwoParticipantSegment).conversationBalance !== undefined;
}

type TableMode = 'single' | 'two' | 'multi';

export function TimelineTable({ isLoading, data, participantCount }: TimelineTableProps) {
  // 4. Determine mode from participantCount
  const mode: TableMode = participantCount === 1 ? 'single' : participantCount === 2 ? 'two' : 'multi';

  // 5. Keep maxMessages logic, but use `useMemo` and prop data
  const maxMessages = useMemo(() => {
    if (!data) return 0;
    return Math.max(...data.map(segment => segment.totalMessages));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
    >
      <Card className="rounded-2xl border border-border bg-card p-6 h-[450px] shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 flex flex-col">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Chat Activity Overview</h3>
          <p className="text-sm text-muted-foreground mb-4">Activity summarized across months.</p>
          <div className="border-t border-border/40 mb-4" />
        </div>

        {/* Table Container with Scroll */}
        <div className="flex-1 overflow-y-auto relative">
          {/* 6. Use `isLoading` prop for skeleton */}
          {isLoading ? (
            <TableSkeleton mode={mode} />
          ) : !data || data.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p>No Monthly Activity data available for this chat.</p>
            </div>
          ) : (
            <table role="table" className="w-full border-collapse text-sm">
              {/* 7. Conditional Table Header */}
              <thead className="sticky top-0 bg-card z-10">
                <tr className="bg-muted/50 text-foreground font-semibold text-left">
                  <th className="py-2 px-3 rounded-l-xl">Month</th>
                  {mode === 'multi' && <th className="py-2 px-3 text-right">Active</th>}
                  <th className="py-2 px-3">Total Messages</th>
                  {mode === 'multi' && <th className="py-2 px-3">Most Active</th>}
                  {mode === 'two' && <th className="py-2 px-3">Conversation Balance</th>}
                  <th className="py-2 px-3 rounded-r-xl">Peak Day</th>
                </tr>
              </thead>
              {/* 8. Conditional Table Body */}
              <tbody>
                {data.map((segment, index) => (
                  <motion.tr
                    key={segment.month}
                    className="odd:bg-background even:bg-muted/30 hover:bg-[hsl(var(--mint))]/10 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Month (Always shown) */}
                    <td className="py-3 px-3 flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-muted-foreground" />
                      {segment.month}
                    </td>
                    
                    {/* Active Participants (Multi-only) */}
                    {isMulti(segment) && (
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {segment.activeParticipants}
                      </td>
                    )}

                    {/* Total Messages (Always shown) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span>{segment.totalMessages}</span>
                        <div className="w-full bg-muted/40 rounded-full h-2 flex-1">
                          <div
                            className="h-2 rounded-full bg-[hsl(var(--mint))]"
                            style={{ width: `${(segment.totalMessages / maxMessages) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Most Active (Multi-only) */}
                    {isMulti(segment) && (
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white flex items-center justify-center text-xs font-semibold">
                            {segment.mostActive[0]}
                          </div>
                          <span>{segment.mostActive}</span>
                        </div>
                      </td>
                    )}

                    {/* Conversation Balance (Two-only) */}
                    {isTwo(segment) && (
                      <td className="py-3 px-3">
                        <ConversationBalanceBar balance={segment.conversationBalance} />
                      </td>
                    )}

                    {/* Peak Day (Always shown) */}
                    <td className="py-3 px-3">
                      <span className="bg-[hsl(var(--mint))]/20 text-[hsl(var(--mint))] px-2 py-1 rounded-md text-xs font-medium">
                        {segment.peakDay}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * 9. New component for the 2-participant balance bar
 */
function ConversationBalanceBar({ balance }: { balance: TwoParticipantSegment["conversationBalance"] }) {
  const { participantA, participantB } = balance;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-full h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--mint))]"
              style={{ width: `${participantA.percentage}%` }}
            />
            <div
              className="h-full bg-[hsl(var(--blue-accent))]"
              style={{ width: `${participantB.percentage}%` }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--mint))]" />
              <span>{participantA.name}: <strong>{participantA.percentage.toFixed(1)}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--blue-accent))]" />
              <span>{participantB.name}: <strong>{participantB.percentage.toFixed(1)}%</strong></span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


/**
 * 10. Updated dynamic skeleton
 */
function TableSkeleton({ mode }: { mode: TableMode }) {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-8 flex-[2]" /> {/* Month */}
          {mode === 'multi' && <Skeleton className="h-8 flex-[1]" />} {/* Active */}
          <Skeleton className="h-8 flex-[3]" /> {/* Total Messages */}
          {mode === 'multi' && <Skeleton className="h-8 flex-[2]" />} {/* Most Active */}
          {mode === 'two' && <Skeleton className="h-8 flex-[2]" />} {/* Balance */}
          <Skeleton className="h-8 flex-[2]" /> {/* Peak Day */}
        </div>
      ))}
    </div>
  );
}