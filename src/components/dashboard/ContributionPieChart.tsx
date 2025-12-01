"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

// Fix: Relaxed the index signature to allow mixed types (string, number, undefined)
interface ContributionPieDatum {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; 
  fill?: string;
}

interface ContributionPieChartProps {
  title: string;
  description: string;
  pieData: ContributionPieDatum[];
  chartConfig: ChartConfig;
  dataKey: string;
  nameKey: string;
  labelFormatter?: (value: number) => string;
}

export function ContributionPieChart({
  title,
  description,
  pieData,
  chartConfig,
  dataKey,
  nameKey,
  labelFormatter
}: ContributionPieChartProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const outerRadius = isMobile ? 90 : 120;

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col overflow-hidden">
      <CardHeader className="items-center pb-0 text-left px-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-0">
        <div className="w-full h-[300px] relative"> 
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-full w-full max-w-[100%]"
          >
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey={nameKey} hideLabel />}
              />
              <Pie
                data={pieData}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                labelLine={false}
                stroke="hsl(var(--card))"  
                strokeWidth={3}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  // Removed unused 'name' variable
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white" 
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-xs sm:text-sm font-semibold drop-shadow-md"
                      style={{ pointerEvents: 'none' }}
                    >
                       {labelFormatter ? labelFormatter(value as number) : value}
                    </text>
                  );
                }}
              >
                {pieData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--card))" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-0 pointer-events-none">
             {pieData.map((item) => (
               <div key={item[nameKey]} className="flex items-center gap-1.5 bg-card/80 px-2 py-1 rounded-full border shadow-sm">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                 <span className="text-xs font-medium text-foreground">{item[nameKey]}</span>
               </div>
             ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}