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
import { Separator } from "@/components/ui/separator";
import {
  MessageSquareText,
  GaugeCircle,
  ShieldCheck,
  FileText,
  UploadCloud,
} from "lucide-react";

export default function HomePage() {
  // Hook to get the current theme (light or dark)
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  console.log(`The current theme is ${theme}`);
  const imageSrc = 
  theme === 'dark'
    ? '/assets/dark-mode-lapi-removebg-preview.png'
    : '/assets/light-mode-lapi-removebg-preview.png';

  return (
    <div className="space-y-24">
      {/* 1️⃣ Hero Section */}
      <section className="w-full pt-16 md:pt-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
          {/* Left Column: Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
              Discover the Emotions Behind Your WhatsApp Chats
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-md">
              Get instant emotional insights from your exported chat files using our advanced sentiment analysis tool.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                size="lg"
                className="px-6 py-3 text-sm md:text-base bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 font-semibold"
                onClick={() => navigate('/upload')}
              >
                Upload Chat
              </Button>
              <Button size="lg" variant="outline" className="px-6 py-3 text-sm md:text-base border-[hsl(var(--mint))] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/10 hover:text-[hsl(var(--mint))] font-semibold">
                View Demo
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Visual with Dynamic Image */}
          <div className="flex justify-center">
        
              <img
                src={imageSrc}
                alt="App interface preview on a laptop"
                className="w-full h-auto max-w-md mx-auto md:max-w-lg object-contain"
              />
            
          </div>
        </div>
      </section>

      {/* 2️⃣ Feature Highlights Section */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Why Choose SentimentScope
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cards with enhanced hover effect */}
            <Card className="p-6 bg-background border border-border transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-foreground">
                Accurate Sentiment Detection
              </h3>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                Understand emotions in each message with advanced NLP models.
              </p>
            </Card>
            <Card className="p-6 bg-background border border-border transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                <GaugeCircle className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-foreground">
                Simple Upload & Instant Results
              </h3>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                Just upload your .txt file and get a full analysis in seconds.
              </p>
            </Card>
            <Card className="p-6 bg-background border border-border transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
              <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-foreground">
                Privacy-First Analysis
              </h3>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                Your chats are processed locally in your browser and never stored.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3️⃣ How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="steps">
              <AccordionTrigger className="text-lg md:text-xl font-medium">
                View Steps
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center gap-4 mt-8">
                  <div className="bg-muted p-6 rounded-xl shadow-sm w-full text-left">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[hsl(var(--mint))] w-6 h-6 flex-shrink-0" />
                      <h4 className="font-semibold text-foreground text-base md:text-lg">
                        Export chat (.txt) from WhatsApp
                      </h4>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-border" />
                  <div className="bg-muted p-6 rounded-xl shadow-sm w-full text-left">
                    <div className="flex items-center gap-3">
                      <UploadCloud className="text-[hsl(var(--mint))] w-6 h-6 flex-shrink-0" />
                      <h4 className="font-semibold text-foreground text-base md:text-lg">
                        Upload and see emotional insights instantly
                      </h4>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 4️⃣ CTA Section (Final Banner) */}
      {/* 4️⃣ CTA Section (Final Banner) */}
    <section className="w-full bg-gradient-to-r from-[hsl(var(--blue-accent))] to-purple-600 dark:from-[var(--cta-gradient-start)] dark:to-[var(--cta-gradient-end)] py-20 text-center transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 👇 Use a consistent light color for the text */}
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
        Start discovering emotions in your chats today.
        </h2>

        {/* 👇 Use a solid white background for the button */}
        <Button 
        size="lg" 
        className="px-6 py-3 text-sm md:text-base bg-white text-[hsl(var(--mint))] font-semibold hover:bg-white/90"
        onClick={() => navigate("/upload")}
        >
        Upload Chat Now
        </Button>

        {/* 👇 Use a light, semi-transparent color for the subtext */}
        <p className="mt-4 text-sm md:text-base text-white/80">
        Your chat file is processed locally. We do not store your data.
        </p>
        
    </div>
    </section>
    </div>
  );
}