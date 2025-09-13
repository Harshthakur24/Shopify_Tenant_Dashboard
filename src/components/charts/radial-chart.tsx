"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export interface RadialChartData {
    period: string;
    desktop: number;
    mobile: number;
}

interface RadialChartStackedProps {
    data: RadialChartData[];
    title?: string;
    description?: string;
    trend?: {
        value: number;
        period: string;
    };
    config?: ChartConfig;
}

const defaultConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function RadialChartStacked({
    data,
    title = "Radial Chart - Stacked",
    description = "Radial data visualization",
    trend,
    config = defaultConfig
}: RadialChartStackedProps) {
    // Use the first data point for radial chart
    const chartData = data.length > 0 ? [data[0]] : [{ period: "current", desktop: 0, mobile: 0 }];
    const totalValue = chartData[0].desktop + chartData[0].mobile;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square w-full max-w-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        innerRadius={80}
                        outerRadius={130}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 16}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {totalValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="desktop"
                            stackId="a"
                            cornerRadius={5}
                            fill="var(--color-desktop)"
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="mobile"
                            fill="var(--color-mobile)"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            {trend && (
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 leading-none font-medium">
                        Trending {trend.value > 0 ? 'up' : 'down'} by {Math.abs(trend.value)}% this {trend.period}
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        {description}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
