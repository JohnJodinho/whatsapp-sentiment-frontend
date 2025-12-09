"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
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
  isExport?: boolean;
}

function useChartColors() {
    const { theme } = useTheme();
    const [tickColor, setTickColor] = useState("#6B7280");
    const [gridColor, setGridColor] = useState("rgba(15, 23, 42, 0.06)");

    useEffect(() => {
        const computedTickColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
        const computedGridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
        setTickColor(computedTickColor ? `hsl(${computedTickColor})` : "#6B7280");
        setGridColor(computedGridColor ? `hsla(${computedGridColor}, 0.5)` : "rgba(15, 23, 42, 0.06)");
    }, [theme]);

    return { tickColor, gridColor };
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
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
  messages: { label: "Messages", color: "hsl(var(--mint))" }, 
} satisfies ChartConfig;


function ActivityByDayChart({
    data,
    isLoading,
    isExport = false
}: {
    data: DayData[] | null;
    isLoading: boolean;
    isExport?: boolean;
}) {
  const id = "pie-activity-by-day";
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
        if (data && data.length > 0) {
            const maxDay = data.reduce((max, current) => (current.messages > max.messages ? current : max));
            setActiveDay(maxDay.day);
        } else {
            setActiveDay(null);
        }
  }, [data]);

  const activeIndex = React.useMemo(() => data?.findIndex((item) => item.day === activeDay) ?? -1, [activeDay, data]);
  const days = React.useMemo(() => data?.map((item) => item.day) ?? [], [data]);
  const totalMessages = React.useMemo(() => data?.reduce((acc, curr) => acc + curr.messages, 0) ?? 0, [data]);
  const singleDayData = data?.length === 1 ? data[0] : null;
  const showDropdown = days.length > 1;

  const outerRadius = isExport ? 100 : (isMobile ? 80 : 120); 
  const innerRadius = isExport ? 50 : (isMobile ? 40 : 60);
  
  if (isLoading) return <Skeleton className="h-[360px] rounded-xl bg-muted/30" />;
  if (!data || data.length === 0) return <EmptyState message="No activity data." icon={PieChartIcon} />;

  const ActiveShape = (props: PieSectorDataItem) => (
      <g style={{ filter: `drop-shadow(0 4px 12px ${props.fill}30)` }}>
        <Sector {...props} outerRadius={outerRadius + 8} stroke="#FFFFFF" strokeWidth={3} />
      </g>
  );

  return (
    <Card data-chart={id} className={`rounded-2xl border bg-card p-0 flex flex-col transition-all duration-300 overflow-hidden ${isExport ? 'border-slate-200 shadow-sm w-full' : 'border-border shadow-sm hover:shadow-lg'}`}>
      <ChartStyle id={id} config={weeklyChartConfig} />
      <CardHeader>
      <div className="flex items-start justify-between p-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground">Activity by Day</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Share of messages by weekday</CardDescription>
        </div>
        {showDropdown && !isExport && (
          <div className="ml-4">
            <Select value={activeDay ?? ""} onValueChange={setActiveDay}>
              <SelectTrigger className="h-8 w-[110px] rounded-lg pl-2.5 text-xs">
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

      <div className="flex flex-wrap gap-x-3 gap-y-2 px-4 pt-3 pb-1 justify-center">
          {Object.entries(weeklyChartConfig)
            .filter(([key]) => key !== 'messages')
            .map(([key, config]) => {
                const color = (config as { color?: string }).color ?? "#94A3B8";
                return (
                  <div key={key} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                      <span className="flex h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground">{config.label}</span>
                  </div>
                );
            })}
      </div>

      <CardContent className="flex items-center justify-center py-6 relative">
        <div className={isExport ? "w-full h-[300px] flex justify-center" : "w-full max-w-[340px] aspect-square flex items-center justify-center"}>
          <ChartContainer id={id} config={weeklyChartConfig} className="w-full h-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="messages"
                  nameKey="day"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={1}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  
                  // FIX STARTS HERE
                  // 1. CRITICAL: Disable animation during export so the circle is fully drawn instantly.
                  isAnimationActive={!isExport} 
                  
                  // 2. Keep the previous flatten logic to ensure clean edges (optional but recommended)
                  activeIndex={activeIndex}
                  activeShape={ActiveShape}
                  // FIX ENDS HERE
                >
                  <Label
                    content={({ viewBox }) => {
                      // The Label logic remains UNCHANGED.
                      // It relies on the 'activeIndex' variable from the component scope,
                      // not the prop passed to Pie. 
                      // This ensures the Text stays correct (showing max value)
                      // even though the visual slice is flattened.
                      if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex !== -1 && data && data[activeIndex]) {
                        const activeData = data[activeIndex];
                        const displayValue = singleDayData ? singleDayData.messages : activeData.messages;
                        const displayLabel = singleDayData ? weeklyChartConfig[singleDayData.day as keyof typeof weeklyChartConfig]?.label : "Messages";
                        const percentage = totalMessages > 0 ? ((activeData.messages / totalMessages) * 100).toFixed(1) : "0.0";
                        const valueColor = activeData.messages === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))";

                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" className="fill-current">
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 16} className="text-xl sm:text-2xl font-bold" style={{ fill: valueColor }}>
                              {displayValue.toLocaleString()}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 6} className="text-xs sm:text-sm fill-muted-foreground">
                              {displayLabel}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="text-xs sm:text-sm fill-muted-foreground">
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
        </div>
      </CardContent>
    </Card>
  );
}


function HourlyActivityChart({
    data,
    isLoading,
    isExport = false // Added prop
}: {
    data: HourData[] | null;
    isLoading: boolean;
    isExport?: boolean;
}) {
  const { tickColor, gridColor } = useChartColors();
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const useVerticalLabels = useMemo(() => {
    if (!data) return false;
    return data.some(item => item.messages >= 100);
  }, [data]);

  const labelOffset = useVerticalLabels ? 20 : 6;

  const peakHourData = React.useMemo(() => data?.reduce((max, current) => (current.messages > max.messages ? current : max), data[0] || { hour: -1, messages: 0 }), [data]);
  const totalMessagesInRange = React.useMemo(() => data?.reduce((sum, item) => sum + item.messages, 0) ?? 0, [data]);

  if (isLoading) return <Skeleton className="h-[360px] rounded-xl bg-muted/30" />;
  if (!data || data.length === 0)
  return <EmptyState message="No hourly data available." icon={BarChart3Icon} />;
  
  return (
    <Card className={`rounded-2xl border bg-card p-0 flex flex-col transition-all duration-300 overflow-hidden ${isExport ? 'border-slate-200 shadow-sm w-full' : 'border-border shadow-sm hover:shadow-lg'}`}>
        <CardHeader>
          <div className="p-4 border-b border-border/50">
              <CardTitle className="text-base font-semibold text-foreground">Peak Chat Activity</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Peak hours and quiet times.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex justify-center p-0 relative pt-4 overflow-hidden">
             {/* Fix: Conditional scrolling */}
             <div className={isExport ? "w-full h-[350px]" : "w-full overflow-x-auto"}>
                <ChartContainer config={hourlyChartConfig} className={isExport ? "w-full h-full" : "w-full min-w-[320px] min-h-[300px]"}>
                  <ResponsiveContainer width="100%" height={isExport ? 350 : 350}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{ top: 25, left: 0, right: 0, bottom: 0 }}
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
                                <stop offset="100%" stopColor="hsl(var(--cyan-accent))" stopOpacity={0.4} /> 
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke={gridColor} horizontal={true} vertical={false} />
                        <XAxis
                            dataKey="hour"
                            tickLine={false} tickMargin={8} axisLine={false}
                            tick={{ fill: tickColor, fontSize: 10 }}
                            tickFormatter={(value) => `${value}h`}
                            interval={2}
                        />
                        <YAxis hide={true} domain={['auto', 'dataMax + 20']} /> 
                        <ChartTooltip cursor={false} content={CustomTooltip} />
                        <Bar
                            dataKey="messages"
                            fill="url(#hourGradient)"
                            radius={[8, 8, 0, 0]} 
                            barSize={18} 
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
                                style={{ fill: 'var(--color-foreground)', fontSize: 10 }}
                                formatter={(value: number) => value > 0 ? value.toLocaleString() : ""}
                            />
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>  
                </ChartContainer>
            </div>
        </CardContent>

        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground p-4 border-t border-border/50 bg-muted/5">
          {peakHourData && peakHourData.messages > 0 && (
            <div className="flex items-center gap-2 font-medium text-foreground">
              Peak: {peakHourData.hour}:00 – {peakHourData.hour + 1}:00 ({peakHourData.messages} msgs)
            </div>
          )}
          <div>Total in range: {totalMessagesInRange.toLocaleString()}</div>
        </CardFooter>
    </Card>
  );
}

export function OptionalInsights({
    activityByDayData,
    hourlyActivityData,
    isLoading,
    isExport = false
}: OptionalInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
      if (isExport) setIsOpen(true);
  }, [isExport]);

  

  if (isExport) {
     return (
        // Added border-slate-200 and white bg
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-none w-full">
           <div className="px-6 py-4 border-b border-muted/50">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                More Insights
              </h2>
           </div>
           <div
              className={cn(
                "grid gap-6 p-4 sm:p-6",
                isExport ? "flex flex-col w-full" : "grid-cols-1 md:grid-cols-2"
              )}
            >
              <div className="w-full">
                <ActivityByDayChart
                  data={activityByDayData}
                  isLoading={isLoading}
                  isExport={isExport}
                />
              </div>
              <div className="w-full">
                <HourlyActivityChart
                  data={hourlyActivityData}
                  isLoading={isLoading}
                  isExport={isExport}
                />
              </div>
            </div>
        </Card>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <CollapsibleTrigger asChild>
            {/* Header ... */}
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
              <div
                className={cn(
                  "grid gap-6 p-4 sm:p-6",
                  isExport ? "flex flex-col w-full" : "grid-cols-1 md:grid-cols-2"
                )}
              >
                <ActivityByDayChart
                  data={activityByDayData}
                  isLoading={isLoading}
                  isExport={isExport}
                />
                <HourlyActivityChart
                  data={hourlyActivityData}
                  isLoading={isLoading}
                  isExport={isExport}
                />
              </div>
            </motion.div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}


function EmptyState({ message = "No insights available yet.", icon: Icon = MessageSquare }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Icon className="w-12 h-12 text-muted-foreground/30" />
      <p className="text-muted-foreground text-sm mt-2">{message}</p>
    </div>
  );
}