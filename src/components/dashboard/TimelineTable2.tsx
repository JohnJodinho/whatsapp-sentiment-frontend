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
  isExport?: boolean;
}

function isMulti(seg: ChatSegment): seg is MultiParticipantSegment {
  return (seg as MultiParticipantSegment).mostActive !== undefined;
}
function isTwo(seg: ChatSegment): seg is TwoParticipantSegment {
  return (seg as TwoParticipantSegment).conversationBalance !== undefined;
}

type TableMode = 'single' | 'two' | 'multi';

export function TimelineTable({ isLoading, data, participantCount, isExport = false }: TimelineTableProps) {
  const mode: TableMode = participantCount === 1 ? 'single' : participantCount === 2 ? 'two' : 'multi';

  const processedData = useMemo(() => {
    if (!data) return [];
    if(isExport) {
      return data.slice(0, 10);
    }
    return data;
  }, [data, isExport]);

  const maxMessages = useMemo(() => {
    if (!processedData) return 0;
    return Math.max(...processedData.map(segment => segment.totalMessages));
  }, [processedData]);


  const participantNames = useMemo(() => {
    if (mode!== "two" || !processedData.length) return null;
    const seg = processedData.find(isTwo);
    if (!seg) return null;
    return {
      a: seg.conversationBalance.participantA.name,
      b: seg.conversationBalance.participantB.name,
    };
  }, [mode, processedData]);
    
  
  const containerClass = isExport 
    ? "h-auto border border-slate-200 shadow-none bg-white" 
    : "h-[450px] border-border shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 bg-card";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
    >
      <Card className={`rounded-2xl border p-6 transition-all duration-300 flex flex-col ${containerClass}`}>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-row justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Chat Activity</h3>
              <p className="text-sm text-muted-foreground">
                 {isExport ? "Recent activity summary." : "Activity summarized across months."}
              </p>
            </div>

            {/* Legend for Two Participants */}
            {participantNames && isExport && (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--mint))]" />
                  <span className="text-xs font-medium max-w-[80px] sm:max-w-[120px] truncate">
                    {participantNames.a}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--blue-accent))]" />
                  <span className="text-xs font-medium max-w-[80px] sm:max-w-[120px] truncate">
                    {participantNames.b}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border/40 mt-1" />
        </div>

        {/* Removed scrollbar for export */}
        <div className={`flex-1 relative ${isExport ? '' : 'overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/20'}`}>
          {isLoading ? (
            <TableSkeleton mode={mode} />
          ) : !processedData || processedData.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p>No Monthly Activity data available.</p>
            </div>
          ) : (
            <table role="table" className={`w-full border-collapse text-sm ${isExport ? '' : 'min-w-[600px]'}`}>
              {/* ... Table Header ... */}
              <thead className={`sticky top-0 bg-card z-10 ${isExport ? '' : 'shadow-sm'}`}>
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
                {processedData.map((segment, index) => (
                  <motion.tr
                    key={segment.month}
                    className="odd:bg-background even:bg-muted/30 hover:bg-[hsl(var(--mint))]/10 transition-colors duration-200 cursor-pointer"
                    initial={isExport ? undefined : { opacity: 0, y: 5 }}
                    animate={isExport ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* ... Cells ... */}
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
                            className="h-1.5 rounded-full bg-[hsl(var(--cyan-accent))]"
                            style={{ width: `${(segment.totalMessages / maxMessages) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {isMulti(segment) && (
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                           <span className="truncate max-w-[80px]">{segment.mostActive}</span>
                        </div>
                      </td>
                    )}

                    {isTwo(segment) && (
                      <td className="py-3 px-3 w-[140px]">
                        <ConversationBalanceBar balance={segment.conversationBalance} isExport={isExport} />
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

function ConversationBalanceBar({ balance, isExport }: { balance: TwoParticipantSegment["conversationBalance"], isExport?: boolean }) {
  const { participantA, participantB } = balance;
  return (
    <div className="flex flex-col gap-1.5">
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

      {/* EDIT: Explicit labels for PDF export since tooltips don't work there */}
      {isExport && (
         <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium leading-none px-0.5">
            <span style={{ color: "hsl(var(--mint))" }}>
              {participantA.percentage.toFixed(0)}%
            </span>
            <span style={{ color: "hsl(var(--blue-accent))" }}>
              {participantB.percentage.toFixed(0)}%
            </span>
         </div>
      )}
    </div>
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