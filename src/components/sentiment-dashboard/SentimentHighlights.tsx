"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { HighlightMessage, HighlightsData } from "@/types/sentimentDashboardData";

interface SentimentHighlightsProps {
  isLoading: boolean;
  data: HighlightsData | null;
}

// --- Reusable Message Card ---
function HighlightCard({
  message,
  type,
}: {
  message: HighlightMessage;
  type: "positive" | "negative";
}) {
  const Icon = type === "positive" ? ThumbsUp : ThumbsDown;
  const iconColor = type === "positive" ? "text-emerald-500" : "text-red-500";

  return (
    <div className="p-1 h-full">
      <Card
          className="h-[160px] flex flex-col justify-between p-5 bg-muted/30 rounded-3xl shadow-md 
          hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300

          border-0 !border-transparent ring-0 outline-none"
      >
        <div className="flex items-start gap-3 mb-2">
          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            "{message.text}"
          </p>
        </div>
        <div className="flex justify-between items-end text-xs text-muted-foreground">
          <span>{message.sender}</span>
          <span>{format(parseISO(message.timestamp), "MMM d, HH:mm")}</span>
        </div>
      </Card>
    </div>
  );
}

// --- Main Component ---
export function SentimentHighlights({ isLoading, data }: SentimentHighlightsProps) {
  if (isLoading) return <HighlightsSkeleton />;

  const noPositive = !data?.topPositive?.length;
  const noNegative = !data?.topNegative?.length;

  if (noPositive && noNegative) {
    return (
      <Card className="rounded-2xl bg-card/60 shadow-md flex items-center justify-center min-h-[350px] col-span-full md:col-span-2">
        <p className="text-muted-foreground">No highlight messages found for this period.</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Positive Highlights */}
      <Card className="rounded-2xl bg-card/60 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 flex flex-col min-h-[350px] border-0 !border-transparent ring-0 outline-none">
        
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold text-emerald-600 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" /> Top Positive Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          {noPositive ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No positive highlights.
            </div>
          ) : (
            <Carousel className="w-full" opts={{ loop: data.topPositive.length > 1 }}>
              <CarouselContent>
                {data.topPositive.map((msg, index) => (
                  <CarouselItem key={msg.id || index}>
                    <HighlightCard message={msg} type="positive" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {data.topPositive.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 h-8 w-8 rounded-full shadow-sm bg-background/70 backdrop-blur-sm hover:bg-background transition border-0 !border-transparent ring-0 outline-none" />
                  <CarouselNext className="right-2 h-8 w-8 rounded-full shadow-sm bg-background/70 backdrop-blur-sm hover:bg-background transition border-0 !border-transparent ring-0 outline-none" />
                </>
              )}
            </Carousel>
          )}
        </CardContent>
      </Card>

      {/* Negative Highlights */}
      <Card className="rounded-2xl bg-card/60 shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 flex flex-col min-h-[350px] border-0 !border-transparent ring-0 outline-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold text-red-600 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5" /> Top Negative Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          {noNegative ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No negative highlights.
            </div>
          ) : (
            <Carousel className="w-full" opts={{ loop: data.topNegative.length > 1 }}>
              <CarouselContent>
                {data.topNegative.map((msg, index) => (
                  <CarouselItem key={msg.id || index}>
                    <HighlightCard message={msg} type="negative" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {data.topNegative.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 h-8 w-8 rounded-full shadow-sm bg-background/70 backdrop-blur-sm hover:bg-background transition border-0 !border-transparent ring-0 outline-none" />
                  <CarouselNext className="right-2 h-8 w-8 rounded-full shadow-sm bg-background/70 backdrop-blur-sm hover:bg-background transition border-0 !border-transparent ring-0 outline-none" />
                </>
              )}
            </Carousel>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Skeleton Component ---
function HighlightsSkeleton() {
  return (
    <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="rounded-2xl bg-card/60 shadow-md p-4 h-[350px] flex flex-col">
          <Skeleton className="h-5 w-1/2 mb-4" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between mt-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </Card>
      ))}
    </div>
  );
}
