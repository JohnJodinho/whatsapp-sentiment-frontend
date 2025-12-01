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
  participantCount: number;
}

function isMulti(seg: ChatSegment): seg is MultiParticipantSegment {
  return (seg as MultiParticipantSegment).mostActive !== undefined;
}
function isTwo(seg: ChatSegment): seg is TwoParticipantSegment {
  return (seg as TwoParticipantSegment).conversationBalance !== undefined;
}

type TableMode = 'single' | 'two' | 'multi';

export function TimelineTable({ isLoading, data, participantCount }: TimelineTableProps) {
  const mode: TableMode = participantCount === 1 ? 'single' : participantCount === 2 ? 'two' : 'multi';

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
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Chat Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Activity summarized across months.</p>
          <div className="border-t border-border/40 mb-4" />
        </div>

        {/* Scrollable Container for Table */}
        <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {isLoading ? (
            <TableSkeleton mode={mode} />
          ) : !data || data.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p>No Monthly Activity data available.</p>
            </div>
          ) : (
            // Min-width added to force horizontal scroll on mobile
            <table role="table" className="w-full min-w-[600px] border-collapse text-sm">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="bg-muted/50 text-foreground font-semibold text-left">
                  <th className="py-2 px-3 rounded-l-xl">Month</th>
                  {mode === 'multi' && <th className="py-2 px-3 text-right">Active</th>}
                  <th className="py-2 px-3">Total Messages</th>
                  {mode === 'multi' && <th className="py-2 px-3">Most Active</th>}
                  {mode === 'two' && <th className="py-2 px-3">Balance</th>}
                  <th className="py-2 px-3 rounded-r-xl">Peak Day</th>
                </tr>
              </thead>
              <tbody>
                {data.map((segment, index) => (
                  <motion.tr
                    key={segment.month}
                    className="odd:bg-background even:bg-muted/30 hover:bg-[hsl(var(--mint))]/10 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-3 px-3 flex items-center gap-2 font-medium">
                      <Clock3 className="w-4 h-4 text-muted-foreground" />
                      {segment.month}
                    </td>
                    
                    {isMulti(segment) && (
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {segment.activeParticipants}
                      </td>
                    )}

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-10 tabular-nums">{segment.totalMessages}</span>
                        <div className="w-24 bg-muted/40 rounded-full h-1.5 hidden sm:block">
                          <div
                            className="h-1.5 rounded-full bg-[hsl(var(--mint))]"
                            style={{ width: `${(segment.totalMessages / maxMessages) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {isMulti(segment) && (
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white flex items-center justify-center text-[10px] font-bold">
                            {segment.mostActive[0]}
                          </div>
                          <span className="truncate max-w-[80px]">{segment.mostActive}</span>
                        </div>
                      </td>
                    )}

                    {isTwo(segment) && (
                      <td className="py-3 px-3 w-[140px]">
                        <ConversationBalanceBar balance={segment.conversationBalance} />
                      </td>
                    )}

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

function TableSkeleton({ mode }: { mode: TableMode }) {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-8 flex-[2]" />
          {mode === 'multi' && <Skeleton className="h-8 flex-[1]" />}
          <Skeleton className="h-8 flex-[3]" />
          {mode === 'multi' && <Skeleton className="h-8 flex-[2]" />}
          {mode === 'two' && <Skeleton className="h-8 flex-[2]" />}
          <Skeleton className="h-8 flex-[2]" />
        </div>
      ))}
    </div>
  );
}