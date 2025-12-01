"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  
  BarChart3,
  MessageCircle,
  ShieldCheck,
  
  Upload,
  
  Lock,
  ArrowRight,
  FileText,
  Terminal,
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-[hsl(var(--mint))]/20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--mint))]/5 to-transparent pointer-events-none" />
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-3xl">
          <Badge variant="outline" className="mb-4 border-[hsl(var(--mint))] text-[hsl(var(--mint))]">
            Documentation & Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-balance">
            Mastering Your <span className="text-[hsl(var(--mint))]">Chat Data</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            SentimentScope transforms your raw WhatsApp history into a secure, interactive dashboard. 
            Here is everything you need to know about exporting data, understanding privacy, and using the tools.
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 mx-auto pb-24 space-y-24 max-w-5xl">
        
        {/* --- SECTION 1: THE HOW-TO (Critical for User Acquisition) --- */}
        <section id="guide" className="scroll-mt-24">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-3 rounded-2xl bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] mb-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">How to Get Started</h2>
            <p className="text-muted-foreground mt-2">
              The only manual step is getting your chat file. It takes about 30 seconds.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 md:p-10">
              <Tabs defaultValue="android" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                  <TabsTrigger value="android" className="text-base">Android</TabsTrigger>
                  <TabsTrigger value="ios" className="text-base">iOS (iPhone)</TabsTrigger>
                </TabsList>
                
                {/* ANDROID INSTRUCTIONS */}
                <TabsContent value="android" className="space-y-6 animate-in fade-in slide-in-from-left-2">
                  <Step 
                    num="1" 
                    title="Open the Chat" 
                    desc="Open WhatsApp and navigate to the specific conversation you want to analyze."
                  />
                  <Step 
                    num="2" 
                    title="Access Menu" 
                    desc={<>Tap the <strong>three dots (⋮)</strong> in the top right corner, then select <strong>More</strong>.</>}
                  />
                  <Step 
                    num="3" 
                    title="Export Chat" 
                    desc={<>Select <strong>Export Chat</strong>. When prompted, choose <strong>WITHOUT MEDIA</strong> (we only analyze text).</>}
                  />
                  <Step 
                    num="4" 
                    title="Save File" 
                    desc="Save the generated .txt file to your device or Google Drive."
                  />
                </TabsContent>

                {/* iOS INSTRUCTIONS */}
                <TabsContent value="ios" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <Step 
                    num="1" 
                    title="Tap Contact Info" 
                    desc="Open the chat and tap the contact's name at the very top of the screen."
                  />
                  <Step 
                    num="2" 
                    title="Scroll to Export" 
                    desc={<>Scroll down to the bottom of the profile page and tap <strong>Export Chat</strong>.</>}
                  />
                  <Step 
                    num="3" 
                    title="Exclude Media" 
                    desc={<>Select <strong>Attach Media? → NO (Without Media)</strong>. This keeps the file small and text-focused.</>}
                  />
                  <Step 
                    num="4" 
                    title="Save to Files" 
                    desc="Choose 'Save to Files' on your iPhone to easily upload it later."
                  />
                </TabsContent>
              </Tabs>

              {/* UPLOAD CTA */}
              <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <FileText className="w-5 h-5 text-[hsl(var(--mint))]" />
                  <span className="text-sm">Accepted format: <strong>.txt</strong> or <strong>.zip</strong> (containing .txt)</span>
                </div>
                <Button onClick={() => navigate("/upload")} className="w-full md:w-auto gap-2 bg-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/90 text-white font-semibold">
                  I have my file, Upload Now <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>


        {/* --- SECTION 2: FEATURE TOUR --- */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What You Get</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Once your data is processed, three powerful tools become available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="General Dashboard"
              desc="The 'Big Picture.' See message counts, busiest times of day, conversation style, and who texts the most. Great for settling arguments about who talks more."
            />
            <FeatureCard 
              icon={<Terminal className="w-6 h-6" />}
              title="Sentiment Analysis"
              desc="The 'Emotional Pulse.' We use AI to track positivity/negativity over time. Spot when the relationship was happiest or identify patterns in arguments."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-6 h-6" />}
              title="Chat with Data"
              desc="The 'Chat-To-Chat Assistant.' Don't just look at charts, ask questions. 'What did we talk about in May 2023?' or 'What does particpantA conversation style say about him?'"
            />
          </div>
        </section>


        {/* --- SECTION 3: PRIVACY & TECH (Technical + Trust) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Privacy Column */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Privacy Architecture</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed">
               We treat your chats as toxic waste in a good way. We don't want to hold them longer than necessary.
             </p>
             
             <ul className="space-y-4 mt-4">
                <PrivacyPoint 
                  title="Transient Storage (TTL)"
                  desc="Your chat data is stored in an ephemeral store with a strict 4-hour Time-To-Live. It is hard-deleted automatically."
                />
                <PrivacyPoint 
                  title="Zero Training"
                  desc="We do NOT use your personal chats to train our AI models. The analysis is performed, insights are extracted, and the raw text is discarded."
                />
                <PrivacyPoint 
                  title="Client-Side Control"
                  desc="You have a 'Delete Now' button that instantly purges your session from our server before the timer expires."
                />
             </ul>
          </div>

          {/* Helpful Tips Column (Replaces Tech Stack) */}
          {/* Helpful Tips Column (Accordion Version) */}
          <Card className="bg-muted/30 border-none">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[hsl(var(--blue-accent))]/10 rounded-lg text-[hsl(var(--blue-accent))]">
                   <Upload className="w-5 h-5" />
                </div>
                <CardTitle>Pro Tips for Best Results</CardTitle>
              </div>
              <CardDescription>
                Click to learn how to get the most accurate and interesting analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="history">
                  <AccordionTrigger className="text-left font-semibold">
                    The More History, The Better
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Sentiment trends need data points. An export with 2 years of history will show much cooler "Relationship Trajectories" than a short chat from last week.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="groups">
                  <AccordionTrigger className="text-left font-semibold">
                    Group Chats Work Too
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    You aren't limited to 1-on-1 chats. Upload your family group or best friend circle to see who sends the most messages (and who just lurks).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="media">
                  <AccordionTrigger className="text-left font-semibold">
                    Media Files are Ignored
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    We automatically skip photos, voice notes, and stickers. This keeps the upload fast, ensures the analysis focuses purely on language, and protects your privacy.
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>

        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="py-12 text-center bg-gradient-to-br from-[hsl(var(--blue-accent))]/10 to-[hsl(var(--mint))]/10 rounded-3xl border border-border/50">
           <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to unlock your insights?</h2>
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button size="lg" onClick={() => navigate("/upload")} className="w-full sm:w-auto bg-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/90 text-white text-lg h-12 px-8 rounded-full shadow-lg shadow-mint/20">
               Upload Chat File
             </Button>
             <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to top
             </Button>
           </div>
        </section>

      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function Step({ num, title, desc }: { num: string, title: string, desc: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--mint))] text-white font-bold shrink-0 text-sm shadow-sm">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-foreground text-lg mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: React.ReactNode }) {
  return (
    <Card className="bg-background border-border/50 hover:border-[hsl(var(--mint))]/50 transition-colors duration-300">
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] flex items-center justify-center mb-2">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {desc}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

function PrivacyPoint({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-1">
        <Lock className="w-5 h-5 text-[hsl(var(--mint))]" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  )
}