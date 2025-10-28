"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardTitle, CardDescription, CardHeader } from "@/components/ui/card"; // Import card parts
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, MessageSquare, PieChartIcon, BarChart3Icon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Label, Pie, PieChart, Sector, Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell, ResponsiveContainer } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"; 
import type { TooltipProps } from "recharts";
import type { DayData, HourData } from "@/types/dasboardData";


interface OptionalInsightsProps {
  activityByDayData: DayData[] | null;
  hourlyActivityData: HourData[] | null;
  isLoading: boolean;
}

// --- Helper: Theme Colors & Chart Ticks ---
function useChartColors() {
    const { theme } = useTheme();
    const [tickColor, setTickColor] = useState("#6B7280"); // Use exact hex
    const [gridColor, setGridColor] = useState("rgba(15, 23, 42, 0.06)"); // Use exact rgba

    useEffect(() => {
        // Re-read CSS variables if needed, though hex values are provided
        const computedTickColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
        const computedGridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();

        // Update if needed, otherwise stick to provided hex/rgba
        setTickColor(computedTickColor ? `hsl(${computedTickColor})` : "#6B7280");
        setGridColor(computedGridColor ? `hsla(${computedGridColor}, 0.5)` : "rgba(15, 23, 42, 0.06)");

    }, [theme]);

    return { tickColor, gridColor };
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // The inner 'payload' property on a tooltip item contains the original data point.
    // We can safely cast it to our HourData type.
    const data: HourData = payload[0].payload;

    return (
      <div className="p-2 text-sm bg-background border border-border rounded-lg shadow-lg">
        <p className="font-bold text-foreground mb-1">{`${data.hour}:00 - ${data.hour + 1}:00`}</p>
        <p className="text-muted-foreground">{`${data.messages.toLocaleString()} messages`}</p>
      </div>
    );
  }
  return null;
};

type DayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const baseHue = 171;       
const baseSaturation = 79; 
const baseLightness = 40;  
const darkenStep = 5;      

const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const dayColorsHex = {} as Record<DayOfWeek, string>;

days.forEach((day, index) => {
  const currentLightness = baseLightness - index * darkenStep;
  dayColorsHex[day] = hslToHex(baseHue, baseSaturation, currentLightness);
});

const weeklyChartConfig = {
  messages: { label: "Messages" },
  mon: { label: "Monday", color: dayColorsHex.mon },
  tue: { label: "Tuesday", color: dayColorsHex.tue },
  wed: { label: "Wednesday", color: dayColorsHex.wed },
  thu: { label: "Thursday", color: dayColorsHex.thu },
  fri: { label: "Friday", color: dayColorsHex.fri },
  sat: { label: "Saturday", color: dayColorsHex.sat },
  sun: { label: "Sunday", color: dayColorsHex.sun },
} satisfies ChartConfig;

const hourlyChartConfig = {
  messages: { label: "Messages", color: "hsl(var(--mint))" }, // Using CSS var for bar fill base
} satisfies ChartConfig;


function ActivityByDayChart({
    data,
    isLoading
}: {
    data: DayData[] | null;
    isLoading: boolean;
}) {
  const id = "pie-activity-by-day";
  
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)"); // Check for mobile

    // This useEffect now processes the `data` prop to set the default active day
    useEffect(() => {
   // Data is now passed as a prop, already processed with 'fill'
        if (data && data.length > 0) {
            const maxDay = data.reduce((max, current) => (current.messages > max.messages ? current : max));
            setActiveDay(maxDay.day);
        } else {
            setActiveDay(null); // Reset if data is empty
        }
    }, [data]); // Runs when the data prop changes

  const activeIndex = React.useMemo(() => data?.findIndex((item) => item.day === activeDay) ?? -1, [activeDay, data]);
  const days = React.useMemo(() => data?.map((item) => item.day) ?? [], [data]);
  const totalMessages = React.useMemo(() => data?.reduce((acc, curr) => acc + curr.messages, 0) ?? 0, [data]);

  // Handle single day scenario (e.g., from date filter) - adjust as needed based on actual filtering logic
  const singleDayData = data?.length === 1 ? data[0] : null;
  const showDropdown = days.length > 1;

  // Define responsive radii
  const outerRadius = isMobile ? 90 : 120;
  const innerRadius = isMobile ? 44 : 60;
  if (isLoading) return <Skeleton className="h-[360px] rounded-xl bg-muted/30" />;
  if (!data || data.length === 0) return <EmptyState message="No activity data." icon={PieChartIcon} />;

  const ActiveShape = (props: PieSectorDataItem) => {
    // Note: Recharts props might not directly match CSS box-shadow. Using filter for SVG glow.
    return (
      <g style={{ filter: `drop-shadow(0 4px 12px ${props.fill}30)` }}>
        <Sector {...props} outerRadius={outerRadius + 10} stroke="#FFFFFF" strokeWidth={3} />
        {/* Optional: Add a subtle outer ring if needed */}
        {/* <Sector {...props} outerRadius={outerRadius + 15} innerRadius={outerRadius + 11} fill={props.fill} fillOpacity={0.3}/> */}
      </g>
    );
  };

  return (
    // Updated card structure with explicit header/content areas
    <Card data-chart={id} className="rounded-2xl border border-border bg-card p-0 flex flex-col shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 overflow-hidden">
      <ChartStyle id={id} config={weeklyChartConfig} />
      {/* Card Header */}
      <CardHeader>
      <div className="flex items-start justify-between p-4 border-b border-border/50">

        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground">Activity by Day</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Share of messages by weekday</CardDescription>
        </div>
      
        {showDropdown && (
          <div className="ml-4">
            <Select value={activeDay ?? ""} onValueChange={setActiveDay}>
              <SelectTrigger className="h-8 w-[120px] rounded-lg pl-2.5 text-xs" aria-label="Select a day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                {days.map((key) => {
                  const config = weeklyChartConfig[key as keyof typeof weeklyChartConfig];
                  if (!config || !('color' in config)) return null;
                  return (
                    <SelectItem key={key} value={key} className="rounded-lg text-xs [&_span]:flex">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: config.color }} />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      </CardHeader>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-3 pb-1 justify-center">
          {Object.entries(weeklyChartConfig)
            .filter(([key]) => key !== 'messages') // Exclude the generic 'messages' config
            .map(([key, config]) => {
                // Safely access color (some entries like 'messages' do not have color).
                // Use a fallback color to be defensive against unexpected shapes.
                const color = (config as { color?: string }).color ?? "#94A3B8";
                return (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                      <span className="flex h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground">{config.label}</span>
                  </div>
                );
            })}
      </div>


      {/* Chart Content */}
      <CardContent className="flex items-center justify-center py-6 relative">
        <ChartContainer
          id={id} config={weeklyChartConfig}
          className="w-full max-w-[340px] aspect-square flex items-center justify-center" // Centering container
          aria-label="Activity by day donut chart" role="img"
        >
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => {
                        const numeric = Number(value);
                        const percentage = totalMessages > 0 ? ((numeric / totalMessages) * 100).toFixed(1) : "0.0";
                        return [`${numeric.toLocaleString()} (${percentage}%)`, weeklyChartConfig[name as keyof typeof weeklyChartConfig]?.label];
                      }}
                      className="rounded-lg" 
                  />}
              />
              <Pie
                data={data} dataKey="messages" nameKey="day"
                innerRadius={innerRadius} outerRadius={outerRadius}
                paddingAngle={1} stroke="#FFFFFF" strokeWidth={1} // White separation
                activeIndex={activeIndex}
                activeShape={ActiveShape}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex !== -1 && data && data[activeIndex]) {
                      const activeData = data[activeIndex];
                      const displayValue = singleDayData ? singleDayData.messages : activeData.messages;
                      const displayLabel = singleDayData ? weeklyChartConfig[singleDayData.day as keyof typeof weeklyChartConfig]?.label : "Messages";
                      const percentage = totalMessages > 0 ? ((activeData.messages / totalMessages) * 100).toFixed(1) : "0.0";
                      const valueColor = activeData.messages === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))";

                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" className="fill-current">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 18} className="text-2xl font-bold" style={{ fill: valueColor }}>
                            {displayValue.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 7} className="text-sm fill-muted-foreground">
                            {displayLabel}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 27} className="text-sm fill-muted-foreground">
                            ({percentage}%)
                          </tspan>
                        </text>
                      );
                    } return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


// --- 2. Hourly Activity Bar Chart ---
function HourlyActivityChart({
    data,
    isLoading
}: {
    data: HourData[] | null;
    isLoading: boolean;
}) {
 
  const { tickColor, gridColor } = useChartColors();
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const useVerticalLabels = useMemo(() => {
    if (!data) return false;
    return data.some(item => item.messages >= 100);
  }, [data]);

  const labelOffset = useVerticalLabels ? 20 : 6;

  const peakHourData = React.useMemo(() => {
     if (!data) return null;
     return data.reduce((max, current) => (current.messages > max.messages ? current : max), data[0] || { hour: -1, messages: 0 });
  }, [data]);

  const totalMessagesInRange = React.useMemo(() => {
      return data?.reduce((sum, item) => sum + item.messages, 0) ?? 0;
  }, [data]);

  if (isLoading) return <Skeleton className="h-[360px] rounded-xl bg-muted/30" />;
  if (!data || data.length === 0)
  return <EmptyState message="No hourly data available." icon={BarChart3Icon} />;
  
  
  
  return (
    <Card className="rounded-2xl border border-border bg-card p-0 flex flex-col shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 overflow-hidden">
        <CardHeader>
          <div className="p-4 border-b border-border/50">
              <CardTitle className="text-base font-semibold text-foreground">When is the Chat Most Active?</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Discover the peak hours and quiet times in your conversation.</CardDescription>
          </div>
        </CardHeader>

        {/* Chart Content */}
        <CardContent className="flex-1 flex justify-center p-0 relative pt-4">
            <ChartContainer config={hourlyChartConfig} className="w-full min-h-[400px]" aria-label="Hourly activity bar chart" role="img">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{ top: 25, left: 10, right: -3, bottom: 0 }} // Increased top margin for labels
                    onMouseMove={(state) => {
                        if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                            setHoveredBarIndex(state.activeTooltipIndex);
                        } else {
                            setHoveredBarIndex(null);
                        }
                    }}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                >
                    <defs>
                        <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="hsl(var(--cyan-accent))" stopOpacity={0.4} /> {/* Mint to Cyan */}
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke={gridColor} horizontal={true} vertical={false} />
                    <XAxis
                        dataKey="hour"
                        tickLine={false} tickMargin={8} axisLine={false}
                        tick={{ fill: tickColor, fontSize: 11 }}
                        tickFormatter={(value) => `${value}h`}
                        interval={2}
                    />
                    <YAxis hide={true} domain={['auto', 'dataMax + 20']} /> {/* Hide Y axis but give padding for labels */}
                    <ChartTooltip
                        cursor={false}
                        content={CustomTooltip}
                    />
                    <Bar
                        dataKey="messages"
                        fill="url(#hourGradient)"
                        radius={[8, 8, 0, 0]} // Rounded top corners
                        barSize={22} // Bar width
                    >
                        {data.map((entry, index) => (
                           <Cell
                             key={`cell-${index}`}
                             stroke={hoveredBarIndex === index || (peakHourData && entry.hour === peakHourData.hour) ? 'hsl(var(--mint))' : 'none'}
                             strokeWidth={hoveredBarIndex === index || (peakHourData && entry.hour === peakHourData.hour) ? 1.5 : 0}
                             strokeOpacity={0.8}
                           />
                         ))}
                        <LabelList
                            dataKey="messages"
                            position="top" 
                            offset={labelOffset}
                            angle={useVerticalLabels ? -90 : 0}
                            style={{ fill: 'var(--color-foreground)', fontSize: 12 }}
                            formatter={(value: number) => value > 0 ? value.toLocaleString() : ""}
                        />
                    </Bar>
                </BarChart>
              </ResponsiveContainer>  
            </ChartContainer>
        </CardContent>

        {/* Footer Summary */}
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground p-4 border-t border-border/50">
          {peakHourData && peakHourData.messages > 0 && (
            <div className="flex items-center gap-2 font-medium text-foreground">
              Peak hour: {peakHourData.hour}:00 – {peakHourData.hour + 1}:00 ({peakHourData.messages} messages)
            </div>
          )}
          <div>Total messages in range: {totalMessagesInRange.toLocaleString()}</div>
        </CardFooter>
    </Card>
  );
}

// --- 3. Main Collapsible Container ---
export function OptionalInsights({
    activityByDayData,
    hourlyActivityData,
    isLoading
}: OptionalInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Adjusted outer card to use standard padding */}
        <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between px-6 py-4 border-b border-muted/50 cursor-pointer group">
              <h2 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-[hsl(var(--mint))] transition-colors">
                Explore More Insights
              </h2>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
             <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Grid within the content area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <ActivityByDayChart data={activityByDayData} isLoading={isLoading} />
                <HourlyActivityChart data={hourlyActivityData} isLoading={isLoading} />
              </div>
            </motion.div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

// --- 4. Reusable Empty State ---
function EmptyState({ message = "No insights available yet.", icon: Icon = MessageSquare }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Icon className="w-12 h-12 text-muted-foreground/30" />
      <p className="text-muted-foreground text-sm mt-2">{message}</p>
    </div>
  );
}