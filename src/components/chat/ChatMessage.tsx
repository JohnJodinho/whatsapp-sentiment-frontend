// src\components\chat\ChatMessage.tsx
// ... imports stay same ... 
import type {
  ChatMessage as ChatMessageType,
  ChatSource,
} from "@/types/chat";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useState, useEffect, type ComponentPropsWithoutRef } from "react";
import rehypeRaw from "rehype-raw";

// ... formatTimestamp and helper functions stay same ...
// ... parseAndReplaceCitations stays same ...
// (Omitting helper functions for brevity, keep existing code)

// Helper for formatting timestamp
const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  
  const GROUPED_CITATION_REGEX = /\[((?:(?:source_table:)?(?:messages|segments_sender):\d+(?:,\s*)?)+)\]/g;
  
  interface ParsedContent {
    content: string;
    sourceMap: Map<string, ChatSource>;
  }
  
  function parseAndReplaceCitations(content: string, sources: ChatSource[]): ParsedContent {
  if (!sources || sources.length === 0) {
    return { content, sourceMap: new Map() };
  }

  const uniqueSources = new Map<string, ChatSource>();
  const citationMap = new Map<string, number>();
  let citationCounter = 1;

  const sourceLookup = new Map<string, ChatSource>();
  sources.forEach((s) => {
    sourceLookup.set(`${s.type}:${s.source_id}`, s);
    sourceLookup.set(`${s.source_table}:${s.source_id}`, s);
  });

  const newContent = content.replace(GROUPED_CITATION_REGEX, (fullTag, groupContent) => {
    const keys = groupContent.split(",").map((k: string) => k.trim());
    const replacements: string[] = [];

    keys.forEach((key: string) => {
      const cleanKey = key.replace("source_table:", "");
      const sourceObject = sourceLookup.get(cleanKey);

      if (sourceObject) {
        let index = citationMap.get(cleanKey);
        if (index === undefined) {
          index = citationCounter++;
          citationMap.set(cleanKey, index);
          uniqueSources.set(String(index), sourceObject);
        }
        // CHANGED: Output a Markdown link instead of HTML
        // Format: [Label](citation:ID)
        replacements.push(`[${index}](citation:${index})`);
      }
    });

    if (replacements.length === 0) return fullTag;
    // Join with spaces or commas if you prefer, but spaces usually look cleaner
    return replacements.join(" "); 
  });

  return { content: newContent, sourceMap: uniqueSources };
}

interface ChatMessageProps {
  message: ChatMessageType;
  onSourceClick: (source: ChatSource) => void;
}

export function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const { role, content, createdAt, sources } = message;
  const isUser = role === "user";

  const [parsedContent, setParsedContent] = useState<ParsedContent>({
    content: content,
    sourceMap: new Map(),
  });

  useEffect(() => {
    if (!isUser && content && sources) {
      setParsedContent(
        parseAndReplaceCitations(content, sources as ChatSource[])
      );
    } else {
      setParsedContent({ content: content, sourceMap: new Map() });
    }
  }, [content, sources, isUser]);

  const motionProps = !isUser
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <motion.div
      {...motionProps}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } 
        /* Mobile: wider bubbles (85%), Desktop: standard (75%) */
        max-w-[85%] md:max-w-[75%]`}
      >
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 text-sm
            ${
              isUser
                ? "self-end bg-gradient-to-l from-mint-100 via-mint-50 to-white text-foreground border border-mint-200 " +
                  "dark:bg-gradient-to-l dark:from-[hsl(var(--mint))]/25 dark:to-transparent dark:border-[hsl(var(--mint))]/50"
                : "self-start bg-gradient-to-r from-cyan-50 via-card to-white text-foreground border border-border/80 " +
                  "dark:bg-gradient-to-r dark:from-[hsl(var(--cyan-accent))]/20 dark:via-background/5 dark:to-[hsl(var(--blue-accent))]/20 dark:border-border/80"
            }
          `}
        >
          {/* Assistant Avatar - Hide on very small screens to save space? Kept for now but adjusted position slightly */}
          {!isUser && (
            <div className="absolute -top-3 -left-3 w-7 h-7 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-sm z-10">
              <BrainCircuit className="w-4 h-4 text-[hsl(var(--cyan-accent))]" />
            </div>
          )}

          {/* Message Content */}
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-[hsl(var(--mint))] prose-a:underline hover:prose-a:opacity-80 dark:prose-invert">
              {parsedContent.content ? (
                <TooltipProvider>
                  <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]} // You can actually remove this now if you want!
                  components={{
                    // CHANGED: We now intercept 'a' tags (links) instead of 'sup'
                    a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
                      // Check if this link is one of our custom citations
                      if (href?.startsWith("citation:")) {
                        const citationId = href.split(":")[1];
                        const source = citationId
                          ? parsedContent.sourceMap.get(citationId)
                          : undefined;

                        if (!source) return <>{children}</>;

                        return (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <sup
                                // We render the <sup> here manually
                                className="cursor-pointer text-[hsl(var(--cyan-accent))] font-bold hover:underline ml-0.5 select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onSourceClick(source);
                                }}
                              >
                                [{children}]
                              </sup>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs bg-popover text-popover-foreground border border-border shadow-lg p-3 rounded-lg"
                            >
                              <p className="text-xs line-clamp-6">{source.text}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      // If it's a normal link, render it normally
                      return (
                        <a href={href} {...props} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {parsedContent.content}
                </ReactMarkdown>
                </TooltipProvider>
              ) : (
                <span className="animate-pulse">|</span>
              )}
            </div>
          )}

          {/* User Timestamp */}
          {isUser && (
            <div className="text-xs text-muted-foreground/70 text-right mt-1.5">
              {formatTimestamp(createdAt)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}