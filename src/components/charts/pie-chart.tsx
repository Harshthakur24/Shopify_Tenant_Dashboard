"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

export interface PieChartData {
    category: string;
    value: number;
    fill: string;
}

interface PieChartLabelProps {
    data: PieChartData[];
    title?: string;
    description?: string;
    trend?: {
        value: number;
        period: string;
    };
    config?: ChartConfig;
}

const defaultConfig = {
    value: {
        label: "Value",
    },
} satisfies ChartConfig

export function PieChartLabel({
    data,
    title = "Pie Chart - Label",
    description = "Data distribution overview",
    trend,
    config = defaultConfig
}: PieChartLabelProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={data} dataKey="value" label nameKey="category" />
                    </PieChart>
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
