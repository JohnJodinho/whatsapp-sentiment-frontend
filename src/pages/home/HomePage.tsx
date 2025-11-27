"use client";

import { useState, useEffect } from "react";
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
// import { Separator } from "@/components/ui/separator";
import {
  MessageSquareText,
  GaugeCircle,
  ShieldAlert, // Changed icon to represent secure alerts/policy
  Bot, // New icon for the RAG bot
  FileText,
  UploadCloud,
  ArrowRight,
  BookOpen, // Icon for documentation
} from "lucide-react";

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
    <div className="space-y-24 font-sans">
      {/* 1️⃣ Hero Section */}
      <section className="w-full pt-16 md:pt-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
          {/* Left Column: Text Content */}
          <div>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-[hsl(var(--mint))] uppercase bg-[hsl(var(--mint))]/10 rounded-full">
              Beta Release
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground tracking-tight">
              Unlock the Emotional Intelligence of Your Chats
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
              Transform raw WhatsApp history into actionable insights. 
              Upload your data for deep semantic analysis and chat directly with your history using our AI assistant.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                size="lg"
                className="px-8 py-6 text-sm md:text-base bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 font-semibold shadow-md transition-all"
                onClick={() => navigate("/upload")}
              >
                Analyze My Data
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-sm md:text-base border-[hsl(var(--mint))] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/10 font-semibold gap-2"
                onClick={() => navigate("/guide")} // Pointing to documentation/how-to
              >
                <BookOpen className="w-4 h-4" />
                Read the Guide
              </Button>
            </div>
            {/* Privacy Disclaimer Strategy: Emphasize the deletion policy */}
            <p className="mt-5 text-xs text-muted-foreground flex items-center gap-2 max-w-sm leading-snug">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" /> 
              <span>
                <strong>Ephemeral Storage Policy:</strong> For your privacy, all data is automatically purged from our servers 4 hours after upload.
              </span>
            </p>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--mint))]/20 to-[hsl(var(--blue-accent))]/20 blur-3xl rounded-full opacity-50" />
            <img
              src={imageSrc}
              alt="SentimentScope Analytics Dashboard"
              className="relative w-full h-auto max-w-md mx-auto md:max-w-lg object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* 2️⃣ Feature Highlights Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Deep Analysis, Strictly Private
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            We combine advanced Multimodal RAG technology with a strict transient data policy to give you insights without compromising long-term privacy.
          </p>
          
          {/* Switched to a 2x2 Grid to accommodate the new Feature (Chat to Chat) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Feature 1: Analysis */}
            <Card className="p-8 bg-background border border-border/60 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-14 h-14 flex items-center justify-center rounded-2xl mb-6">
                <MessageSquareText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Sentiment & Tone Trajectory
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Our backend utilizes FastAPI and advanced NLP models to detect subtle emotional shifts, tracking how conversations evolve over time.
              </p>
            </Card>

            {/* Feature 2: RAG / Chat-to-Chat (NEW) */}
            <Card className="p-8 bg-background border border-border/60 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-14 h-14 flex items-center justify-center rounded-2xl mb-6">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Interactive AI Assistant
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Don't just view charts—talk to them. Use our Multimodal RAG interface to ask questions about specific messages or clarify dashboard visuals.
              </p>
            </Card>

            {/* Feature 3: Speed */}
            <Card className="p-8 bg-background border border-border/60 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-14 h-14 flex items-center justify-center rounded-2xl mb-6">
                <GaugeCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                High-Performance Parsing
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Leveraging the speed of a robust backend architecture to process years of chat history and generate comprehensive visualizations in seconds.
              </p>
            </Card>

            {/* Feature 4: Privacy (Updated Strategy) */}
            <Card className="p-8 bg-background border border-border/60 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <div className="bg-amber-500/10 text-amber-600 w-14 h-14 flex items-center justify-center rounded-2xl mb-6">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Transient Data Architecture
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We employ a strict <strong>4-hour Time-To-Live (TTL)</strong> policy. Your chats are encrypted, processed, and then automatically and permanently deleted from our Postgres database.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3️⃣ Workflow Section */}
      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Seamless Integration</h2>
          <p className="text-muted-foreground mb-8">
            No complex setup required. Go from export to insight in two simple steps.
          </p>
          
          <Accordion type="single" collapsible className="w-full border rounded-xl overflow-hidden shadow-sm">
            <AccordionItem value="steps" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline hover:bg-muted/50 transition-colors">
                View the Process
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 bg-muted/20">
                <div className="flex flex-col gap-6 mt-4">
                  
                  {/* Step 1 */}
                  <div className="flex items-start text-left gap-4 bg-background p-4 rounded-lg border">
                    <div className="bg-muted text-foreground font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 border">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-[hsl(var(--mint))]" />
                        <h4 className="font-semibold text-foreground">Export Data Source</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Export your chat history directly from WhatsApp as a standard <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.txt</span> file (without media).
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center -my-2">
                    <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start text-left gap-4 bg-background p-4 rounded-lg border">
                    <div className="bg-muted text-foreground font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 border">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud className="w-4 h-4 text-[hsl(var(--mint))]" />
                        <h4 className="font-semibold text-foreground">Secure Upload & Auto-Purge</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload to our secure analysis engine. A dashboard is generated instantly, and the deletion timer begins immediately.
                      </p>
                    </div>
                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 4️⃣ CTA Section */}
      <section className="w-full bg-gradient-to-br from-[hsl(var(--blue-accent))] to-indigo-700 dark:from-[var(--cta-gradient-start)] dark:to-[var(--cta-gradient-end)] py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to decode your conversations?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Experience the power of RAG-based analysis. Upload your chat, ask questions, and get clarity securely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-6 bg-white text-[hsl(var(--mint))] hover:bg-white/90 text-base font-bold shadow-xl transition-transform hover:scale-105"
              onClick={() => navigate("/upload")}
            >
              Start Analysis Now
            </Button>
            <p className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Data auto-expires in 4 hours
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}