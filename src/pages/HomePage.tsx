
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
  return (
    
      <div className="space-y-24">
        {/* 1️⃣ Hero Section */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container grid grid-cols-1 md:grid-cols-2 items-center gap-12 max-w-7xl mx-auto px-4 md:px-8">
            {/* Left Column: Text Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
                Discover the Emotions Behind Your WhatsApp Chats
              </h1>
              <p className="mt-4 text-base text-muted-foreground max-w-md">
                Get instant emotional insights from your exported chat files using our advanced sentiment analysis tool.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Button className="bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 font-semibold">
                  Upload Chat
                </Button>
                <Button variant="outline" className="border-[hsl(var(--mint))] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]
/10 hover:text-[hsl(var(--mint))] font-semibold">
                  View Demo
                </Button>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="flex justify-center">
                <img
                  src="/assets/light-mode-lapi-removebg-preview.png"
                  alt="App interface preview on a laptop"
                  className="w-full max-w-md mx-auto md:mx-0 rounded-2xl shadow-lg"
                />
            </div>
          </div>
        </section>

        {/* 2️⃣ Feature Highlights Section */}
        <section className="py-20 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Why Choose SentimentScope
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <Card className="p-6 bg-background border border-border hover:shadow-md transition">
                <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Accurate Sentiment Detection
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Understand emotions in each message with advanced NLP models.
                </p>
              </Card>
              {/* Card 2 */}
              <Card className="p-6 bg-background border border-border hover:shadow-md transition">
                <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                  <GaugeCircle className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Simple Upload & Instant Results
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Just upload your .txt file and get a full analysis in seconds.
                </p>
              </Card>
              {/* Card 3 */}
              <Card className="p-6 bg-background border border-border hover:shadow-md transition">
                <div className="bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] w-12 h-12 flex items-center justify-center rounded-full mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Privacy-First Analysis
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your chats are processed locally in your browser and never stored.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 3️⃣ How It Works Section */}
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="steps">
                <AccordionTrigger className="text-lg font-medium">
                  View Steps
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col items-center gap-4 mt-8">
                    {/* Step 1 */}
                    <div className="bg-muted p-6 rounded-xl shadow-sm w-full md:w-3/4 text-left">
                      <div className="flex items-center gap-3">
                        <FileText className="text-[hsl(var(--mint))] w-6 h-6 flex-shrink-0" />
                        <h4 className="font-semibold text-foreground">
                          Export chat (.txt) from WhatsApp (without media)
                        </h4>
                      </div>
                    </div>
                    
                    <Separator orientation="vertical" className="h-6 bg-border" />

                    {/* Step 2 */}
                    <div className="bg-muted p-6 rounded-xl shadow-sm w-full md:w-3/4 text-left">
                      <div className="flex items-center gap-3">
                        <UploadCloud className="text-[hsl(var(--mint))] w-6 h-6 flex-shrink-0" />
                        <h4 className="font-semibold text-foreground">
                          Upload and analyze instantly — see emotional insights in seconds
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
        <section className="w-full bg-gradient-to-r from-[hsl(var(--blue-accent))] to-purple-600 py-20 text-center text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start discovering emotions in your chats today.
            </h2>
            <Button className="bg-primary-foreground text-[hsl(var(--mint))] font-semibold hover:opacity-90">
              Upload Chat Now
            </Button>
            <p className="mt-4 text-sm opacity-80">
              Your chat file is processed locally. We do not store your data.
            </p>
          </div>
        </section>
      </div>
    
  );
}