// src\components\chat\ChatMessage.tsx

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




// Helper for formatting timestamp
const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// UPDATED REGEX: Captures the whole bracket group, allowing for comma-separated lists
// Example match: "[messages:123, segments_sender:456]"
const GROUPED_CITATION_REGEX = /\[((?:(?:messages|segments_sender):\d+(?:,\s*)?)+)\]/g;

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

  // Create a quick lookup map for sources
  const sourceLookup = new Map<string, ChatSource>();
  sources.forEach((s) => {
    // Normalize key format just in case
    sourceLookup.set(`${s.type}:${s.source_id}`, s);
    // Also support the format coming from mapBackendHistory if it differs
    sourceLookup.set(`${s.source_table}:${s.source_id}`, s);
  });

  // Replace the bracket groups with HTML sup tags
  const newContent = content.replace(GROUPED_CITATION_REGEX, (fullTag, groupContent) => {
    // groupContent is likely "messages:123, segments_sender:456"
    
    // Split by comma to handle multiple sources in one bracket
    const keys = groupContent.split(",").map((k: string) => k.trim());
    
    const replacements: string[] = [];

    keys.forEach((key: string) => {
      // Attempt to find the source
      const sourceObject = sourceLookup.get(key);

      if (sourceObject) {
        let index = citationMap.get(key);
        if (index === undefined) {
          index = citationCounter++;
          citationMap.set(key, index);
          uniqueSources.set(String(index), sourceObject);
        }
        // We create a custom `sup` tag with the ID to be picked up by ReactMarkdown components
        replacements.push(`<sup data-citation-id="${index}">[${index}]</sup>`);
      }
    });

    // If no valid sources were found in this group, return the original text
    if (replacements.length === 0) return fullTag;

    // Return the concatenated sup tags (e.g. <sup>[1]</sup><sup>[2]</sup>)
    return replacements.join("");
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
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[75%]`}
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
          {/* Assistant Avatar */}
          {!isUser && (
            <div className="absolute -top-3 -left-3 w-7 h-7 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-sm">
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
                    // IMPORTANT: This enables parsing of the HTML <sup> tags we injected
                    rehypePlugins={[rehypeRaw]} 
                    components={{
                      // We intercept the 'sup' tag. 
                      // ReactMarkdown will match the <sup data-citation-id="x"> we created.
                        sup: ({ node: _node, ...props }: { node?: unknown } & ComponentPropsWithoutRef<"sup"> & { "data-citation-id"?: string }) => {
                            const citationId = props["data-citation-id"];
                            const source = citationId
                              ? parsedContent.sourceMap.get(citationId)
                              : undefined;

                            if (!source) {
                              // If no source mapped, just render the brackets
                              return <sup {...props} />;
                            }
                            

                        

                        return (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <sup
                                className="cursor-pointer text-[hsl(var(--cyan-accent))] font-bold hover:underline ml-0.5 select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault(); // Prevent bubbling
                                  onSourceClick(source);
                                }}
                              >
                                {/* Ensure the children (the [1]) are rendered */}
                                {props.children}
                              </sup>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-xs bg-popover text-popover-foreground border border-border shadow-lg p-3 rounded-lg"
                            >
                              {/* Display the raw text as requested */}
                              <p className="text-xs line-clamp-6">
                                {source.text}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      },
                    }}
                  >
                    {parsedContent.content}
                  </ReactMarkdown>
                </TooltipProvider>
              ) : (
                // Blinking cursor for streaming
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