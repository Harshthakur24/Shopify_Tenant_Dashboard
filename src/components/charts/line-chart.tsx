"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

export interface LineChartData {
    period: string;
    desktop: number;
    mobile: number;
}

interface LineChartMultipleProps {
    data: LineChartData[];
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

export function LineChartMultiple({
    data,
    title = "Line Chart - Multiple",
    description = "Showing trends over time",
    trend,
    config = defaultConfig
}: LineChartMultipleProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                // Handle both month names and date formats
                                if (value.length > 10) return value.slice(0, 3)
                                return value
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="desktop"
                            type="monotone"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="mobile"
                            type="monotone"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            {trend && (
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 leading-none font-medium">
                                Trending {trend.value > 0 ? 'up' : 'down'} by {Math.abs(trend.value)}% this {trend.period}
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                {description}
                            </div>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
