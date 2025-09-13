"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export interface RadarChartData {
    category: string;
    desktop: number;
    mobile: number;
}

interface RadarChartMultipleProps {
    data: RadarChartData[];
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

export function RadarChartMultiple({
    data,
    title = "Radar Chart - Multiple",
    description = "Multi-dimensional data comparison",
    trend,
    config = defaultConfig
}: RadarChartMultipleProps) {
    return (
        <Card>
            <CardHeader className="items-center pb-4">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart data={data}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <PolarAngleAxis dataKey="category" />
                        <PolarGrid />
                        <Radar
                            dataKey="desktop"
                            fill="var(--color-desktop)"
                            fillOpacity={0.6}
                        />
                        <Radar dataKey="mobile" fill="var(--color-mobile)" />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            {trend && (
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 leading-none font-medium">
                        Trending {trend.value > 0 ? 'up' : 'down'} by {Math.abs(trend.value)}% this {trend.period}
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        {description}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
