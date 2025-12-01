"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquareText,
  GaugeCircle,
  ShieldAlert,
  Bot,
  FileText,
  UploadCloud,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const imageSrc =
    theme === "dark"
      ? "/assets/dark-mode-lapi-removebg-preview.png"
      : "/assets/light-mode-lapi-removebg-preview.png";

  return (
    // 1. Changed space-y-24 to space-y-16 for tighter mobile flow
    // 2. Added overflow-x-hidden to prevent horizontal scrolling bugs
    <div className="space-y-16 md:space-y-24 font-sans overflow-x-hidden pb-10">
      
      {/* -------------------- */}
      {/* 1️⃣ Hero Section      */}
      {/* -------------------- */}
      <section className="w-full pt-10 md:pt-24 bg-background px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
          
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[hsl(var(--mint))] uppercase bg-[hsl(var(--mint))]/10 rounded-full">
              Beta Release
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground tracking-tight text-balance">
              Unlock the Emotional Intelligence of Your Chats
            </h1>
            
            <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
              Transform raw WhatsApp history into actionable insights. 
              Upload your data for deep semantic analysis and chat directly with your history using our AI assistant.
            </p>

            {/* Mobile: Vertical Stack | Desktop: Horizontal Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 font-semibold shadow-lg shadow-mint/20 transition-all active:scale-95"
                onClick={() => navigate("/upload")}
              >
                Analyze My Data
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-base border-[hsl(var(--mint))] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/10 font-semibold gap-2 active:scale-95"
                onClick={() => navigate("/guide")}
              >
                <BookOpen className="w-4 h-4" />
                Read the Guide
              </Button>
            </div>

            <div className="mt-6 flex justify-center md:justify-start">
              <p className="text-xs text-muted-foreground flex items-center gap-2 max-w-sm text-left bg-muted/30 p-2 rounded-lg border border-border/50">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" /> 
                <span>
                  <strong>Privacy First:</strong> Data is purged 4 hours after upload.
                </span>
              </p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex justify-center relative mt-4 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--mint))]/20 to-[hsl(var(--blue-accent))]/20 blur-3xl rounded-full opacity-50" />
            <img
              src={imageSrc}
              alt="SentimentScope Analytics Dashboard"
              className="relative w-[85%] md:w-full h-auto max-w-md object-contain drop-shadow-2xl animate-float-slow"
            />
          </div>
        </div>
      </section>

      {/* -------------------- */}
      {/* 2️⃣ Features Section  */}
      {/* -------------------- */}
      <section className="py-12 md:py-20 bg-muted/30 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Deep Analysis, Strictly Private
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            We combine advanced Multimodal RAG technology with a strict transient data policy.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Feature Cards: Reduced padding (p-5) for mobile breathing room */}
            <FeatureCard 
              icon={<MessageSquareText className="w-6 h-6" />}
              title="Sentiment Trajectory"
              desc="Detect subtle emotional shifts and track how conversations evolve over time using advanced NLP."
              colorClass="text-[hsl(var(--mint))]"
              bgClass="bg-[hsl(var(--mint))]/10"
            />

            <FeatureCard 
              icon={<Bot className="w-6 h-6" />}
              title="Interactive AI Assistant"
              desc="Don't just view charts—talk to them. Ask questions about specific messages or visuals."
              colorClass="text-[hsl(var(--mint))]"
              bgClass="bg-[hsl(var(--mint))]/10"
            />

            <FeatureCard 
              icon={<GaugeCircle className="w-6 h-6" />}
              title="High-Performance Parsing"
              desc="Process years of chat history and generate comprehensive visualizations in seconds."
              colorClass="text-[hsl(var(--mint))]"
              bgClass="bg-[hsl(var(--mint))]/10"
            />

            <FeatureCard 
              icon={<ShieldAlert className="w-6 h-6" />}
              title="Transient Data Architecture"
              desc="Strict 4-hour TTL policy. Your chats are encrypted, processed, and permanently deleted."
              colorClass="text-amber-600"
              bgClass="bg-amber-500/10"
            />
          </div>
        </div>
      </section>

      {/* -------------------- */}
      {/* 3️⃣ Workflow Section  */}
      {/* -------------------- */}
      <section className="py-12 md:py-20 bg-background px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Seamless Integration</h2>
          <p className="text-muted-foreground mb-8">
            Go from export to insight in two simple steps.
          </p>
          
          <Accordion type="single" collapsible className="w-full border rounded-xl overflow-hidden shadow-sm bg-card">
            <AccordionItem value="steps" className="border-none">
              <AccordionTrigger className="px-6 py-5 text-lg font-medium hover:no-underline hover:bg-muted/50 transition-colors">
                View the Process
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6 pt-2 bg-muted/10">
                <div className="flex flex-col gap-6 mt-4">
                  
                  {/* Step 1 */}
                  <div className="flex items-start text-left gap-4 bg-background p-4 rounded-lg border shadow-sm">
                    <div className="bg-muted text-foreground font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 border text-sm">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-[hsl(var(--mint))]" />
                        <h4 className="font-semibold text-foreground text-sm md:text-base">Export Data Source</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Export chat history from WhatsApp as a <span className="font-mono bg-muted px-1 rounded">.txt</span> file (no media).
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center -my-3 z-10 relative">
                    <div className="bg-background p-1 rounded-full border shadow-sm">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start text-left gap-4 bg-background p-4 rounded-lg border shadow-sm">
                    <div className="bg-muted text-foreground font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 border text-sm">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud className="w-4 h-4 text-[hsl(var(--mint))]" />
                        <h4 className="font-semibold text-foreground text-sm md:text-base">Secure Upload</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Upload to the engine. Dashboard generates instantly, deletion timer starts.
                      </p>
                    </div>
                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* -------------------- */}
      {/* 4️⃣ CTA Section       */}
      {/* -------------------- */}
      <section className="w-full bg-gradient-to-br from-[hsl(var(--blue-accent))] to-indigo-700 dark:from-[var(--cta-gradient-start)] dark:to-[var(--cta-gradient-end)] py-16 md:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to decode?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your chat, ask questions, and get clarity securely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-6 bg-white text-[hsl(var(--mint))] hover:bg-white/90 text-base font-bold shadow-xl active:scale-95 transition-all"
              onClick={() => navigate("/upload")}
            >
              Start Analysis Now
            </Button>
            <p className="text-white/60 text-xs sm:text-sm mt-4 sm:mt-0 sm:ml-6 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4" /> Auto-expires in 4h
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-component to clean up render loop and enforce consistent mobile padding
function FeatureCard({ icon, title, desc, colorClass, bgClass }: { icon: ReactNode, title: string, desc: string, colorClass: string, bgClass: string }) {
  return (
    <Card className="p-5 md:p-8 bg-background border border-border/60 transition-all duration-300 ease-in-out hover:shadow-lg active:scale-[0.99]">
      <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl mb-4", bgClass, colorClass)}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  )
}