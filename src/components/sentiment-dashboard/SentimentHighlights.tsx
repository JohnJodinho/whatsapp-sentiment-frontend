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
import { ThumbsUp, ThumbsDown } from "lucide-react"; // Icons for sentiment

// --- Data Structure ---
interface HighlightMessage {
  id: number | string;
  sender: string;
  text: string; // Snippet
  timestamp: string; // ISO string
  score: number;
}
interface HighlightsData {
  topPositive: HighlightMessage[];
  topNegative: HighlightMessage[];
}

interface SentimentHighlightsProps {
  isLoading: boolean;
  data: HighlightsData | null;
}

// --- Reusable Message Card ---
function HighlightCard({ message, type }: { message: HighlightMessage, type: 'positive' | 'negative' }) {
  const Icon = type === 'positive' ? ThumbsUp : ThumbsDown;
  const iconColor = type === 'positive' ? 'text-emerald-500' : 'text-red-500';
//   const scoreColor = type === 'positive' ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="p-1 h-full"> {/* Padding for carousel spacing */}
      <Card className="h-full flex flex-col justify-between p-4 bg-muted/30">
        <div className="flex items-start gap-3 mb-2">
          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
          <p className="text-sm text-foreground leading-relaxed italic">
            "{message.text}"
          </p>
        </div>
        <div className="flex justify-between items-end mt-2 text-xs text-muted-foreground">
          <span>{message.sender}</span>
          <span>{format(parseISO(message.timestamp), 'MMM d, HH:mm')}</span>
          {/* Optional: Show score */}
          {/* <span className={`font-medium ${scoreColor}`}>Score: {message.score.toFixed(2)}</span> */}
        </div>
      </Card>
    </div>
  );
}


// --- Main Component ---
export function SentimentHighlights({ isLoading, data }: SentimentHighlightsProps) {

  // Handle Loading State
  if (isLoading) {
    return <HighlightsSkeleton />;
  }

  // Handle Empty State
  const noPositive = !data?.topPositive || data.topPositive.length === 0;
  const noNegative = !data?.topNegative || data.topNegative.length === 0;

  if (noPositive && noNegative) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm min-h-[250px] flex items-center justify-center col-span-full md:col-span-2">
        <p className="text-muted-foreground">No highlight messages found for this period.</p>
      </Card>
    );
  }

  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      // Ensure it spans correctly in the parent grid
      className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Positive Highlights */}
      <Card className="rounded-2xl border bg-card shadow-sm flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold text-emerald-600 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5"/> Top Positive Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          {noPositive ? (
             <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No positive highlights.</div>
          ) : (
             <Carousel className="w-full" opts={{ loop: data.topPositive.length > 1 }}>
               <CarouselContent>
                 {data.topPositive.map((msg, index) => (
                   <CarouselItem key={msg.id || index}>
                     <HighlightCard message={msg} type="positive" />
                   </CarouselItem>
                 ))}
               </CarouselContent>
               {data.topPositive.length > 1 && <CarouselPrevious className="left-1 h-6 w-6"/>}
               {data.topPositive.length > 1 && <CarouselNext className="right-1 h-6 w-6"/>}
             </Carousel>
           )}
        </CardContent>
      </Card>

      {/* Negative Highlights */}
       <Card className="rounded-2xl border bg-card shadow-sm flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold text-red-600 flex items-center gap-2">
             <ThumbsDown className="h-5 w-5"/> Top Negative Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
           {noNegative ? (
             <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No negative highlights.</div>
          ) : (
           <Carousel className="w-full" opts={{ loop: data.topNegative.length > 1 }}>
             <CarouselContent>
               {data.topNegative.map((msg, index) => (
                 <CarouselItem key={msg.id || index}>
                   <HighlightCard message={msg} type="negative" />
                 </CarouselItem>
               ))}
             </CarouselContent>
             {data.topNegative.length > 1 && <CarouselPrevious className="left-1 h-6 w-6"/>}
             {data.topNegative.length > 1 && <CarouselNext className="right-1 h-6 w-6"/>}
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
       {/* Skeleton for Positive */}
       <Card className="rounded-2xl border bg-card shadow-sm p-4 h-[250px] flex flex-col">
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
        {/* Skeleton for Negative */}
       <Card className="rounded-2xl border bg-card shadow-sm p-4 h-[250px] flex flex-col">
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
    </div>
  );
}
