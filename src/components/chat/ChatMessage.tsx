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
  
  const GROUPED_CITATION_REGEX = /\[\s*((?:(?:[\w_]+:\s*)*\d+\s*[;,]?\s*)+)\s*\]/g;
  
  interface ParsedContent {
    content: string;
    sourceMap: Map<string, ChatSource>;
  }
  
  function parseAndReplaceCitations(
    content: string,
    sources: ChatSource[]
  ): ParsedContent {
    if (!sources || sources.length === 0) {
      return { content, sourceMap: new Map() };
    }

    const uniqueSources = new Map<string, ChatSource>();
    const citationMap = new Map<string, number>();
    let citationCounter = 1;

    const sourceLookup = new Map<string, ChatSource>();
    sources.forEach((s) => {
      const id = String(s.source_id);
      // 1. Map strictly by ID so we can find "203319" even without a prefix
      sourceLookup.set(id, s);
      
      // 2. Optional: Keep composite keys if needed
      if (s.type) sourceLookup.set(`${s.type}:${id}`, s);
    });

    const newContent = content.replace(
      GROUPED_CITATION_REGEX,
      (fullTag, groupContent) => {
        // CHANGED: Split by either comma OR semicolon
        const keys = groupContent.split(/[;,]/).map((k: string) => k.trim());
        
        const replacements: string[] = [];

        keys.forEach((key: string) => {
          if (!key) return;

          // CHANGED: Aggressively extract just the *last number* in the string.
          // "source_table:202444" -> "202444"
          // "203319"              -> "203319"
          const idMatch = key.match(/(\d+)$/);
          const lookupKey = idMatch ? idMatch[1] : key;

          const sourceObject = sourceLookup.get(lookupKey);

          if (sourceObject) {
            const uniqueKey = `${sourceObject.type || 'source'}:${sourceObject.source_id}`;
            
            let index = citationMap.get(uniqueKey);
            if (index === undefined) {
              index = citationCounter++;
              citationMap.set(uniqueKey, index);
              uniqueSources.set(String(index), sourceObject);
            }
            
            // Using the Hash Link format we fixed earlier
            replacements.push(`[${index}](#citation-${index})`);
          }
        });

        if (replacements.length === 0) return fullTag;
        return replacements.join(" "); // Result: "[1](#citation-1) [2](#citation-2)"
      }
    );

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
                    rehypePlugins={[rehypeRaw]} 
                    components={{
                      a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
                        // 1. Check if the link starts with our hash prefix
                        if (href?.startsWith("#citation-")) {
                          
                          // 2. FIX: Extract ID by replacing the prefix, not splitting by colon
                          const citationId = href.replace("#citation-", "");
                          
                          const source = citationId
                            ? parsedContent.sourceMap.get(citationId)
                            : undefined;

                          // If source isn't found, render plain text
                          if (!source) return <>{children}</>;

                          // 3. Render the clickable Tooltip
                          return (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <sup
                                  className="cursor-pointer text-[hsl(var(--cyan-accent))] font-bold hover:underline ml-0.5 select-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault(); // crucial: stops the browser from jumping to top
                                    onSourceClick(source);
                                  }}
                                >
                                  [{children}]
                                </sup>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="center"
                                // Mobile: max-w-[80vw] ensures it doesn't go off screen
                                // Desktop: max-w-sm (24rem) for a nice reading width
                                className="max-w-[80vw] sm:max-w-sm bg-popover text-popover-foreground border border-border shadow-xl p-3 rounded-lg z-50 select-none"
                              >
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                                    Source Preview (ID: {citationId})
                                  </p>
                                  <p className="text-sm leading-snug line-clamp-4 break-words text-foreground/90">
                                    {source.text}
                                  </p>
                                  <p className="text-[10px] text-[hsl(var(--cyan-accent))] font-medium mt-1 opacity-80">
                                    Click to view full source
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        // Default behavior for normal links (e.g. google.com)
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