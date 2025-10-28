"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// Define props for the new reusable pie chart
// Typed interface for pie data entries: keys are dynamic but values are string or number,
// and the numeric value for dataKey will be passed to the label formatter.
interface ContributionPieDatum {
  [key: string]: string | number;
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

}: ContributionPieChartProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-[hsl(var(--mint))]/10 transition-all duration-300 h-[450px] flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[300px]" // Use fixed height
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey={dataKey} hideLabel />}
            />
            <Pie
              data={pieData}
              dataKey={dataKey}
              nameKey={nameKey}
              labelLine={false}
              stroke="#ffffffff"  
              strokeWidth={3}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="#c9c9c9ff"
                    className="text-sm font-medium"
                  >
                    {/* Use the dynamic formatter */}
                    {String(payload[nameKey])}
                  </text>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}