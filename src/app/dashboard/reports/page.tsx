"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const ingredientUsageData = [
  { name: "Chicken", value: 400 },
  { name: "Potatoes", value: 300 },
  { name: "Rice", value: 300 },
  { name: "Carrots", value: 200 },
  { name: "Onions", value: 278 },
  { name: "Beef", value: 189 },
];

const mealPopularityData = [
  { meal: "Breakfast", popularity: 2400 },
  { meal: "Lunch", popularity: 4567 },
  { meal: "Dinner", popularity: 1398 },
];
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

const chartConfigBar = {
  value: { label: "Usage (kg)" },
  Chicken: { label: "Chicken", color: "hsl(var(--chart-1))" },
  Potatoes: { label: "Potatoes", color: "hsl(var(--chart-2))" },
  Rice: { label: "Rice", color: "hsl(var(--chart-3))" },
  Carrots: { label: "Carrots", color: "hsl(var(--chart-4))" },
  Onions: { label: "Onions", color: "hsl(var(--chart-5))" },
  Beef: { label: "Beef", color: "hsl(var(--chart-1))" },
};

const chartConfigPie = {
    popularity: { label: "Popularity" },
    Breakfast: { label: "Breakfast", color: "hsl(var(--chart-1))" },
    Lunch: { label: "Lunch", color: "hsl(var(--chart-2))" },
    Dinner: { label: "Dinner", color: "hsl(var(--chart-3))" },
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Gain insights into your kitchen's operations.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="grid gap-2">
                    <Label htmlFor="period">Period</Label>
                    <Select defaultValue="last-30-days">
                        <SelectTrigger id="period" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="last-7-days">Last 7 days</SelectItem>
                            <SelectItem value="last-30-days">Last 30 days</SelectItem>
                            <SelectItem value="last-3-months">Last 3 months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="report-type">Report Type</Label>
                     <Select defaultValue="usage">
                        <SelectTrigger id="report-type" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usage">Ingredient Usage</SelectItem>
                            <SelectItem value="popularity">Meal Popularity</SelectItem>
                            <SelectItem value="wastage">Wastage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="self-end">
                    <Button>Generate Report</Button>
                </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Ingredient Usage</CardTitle>
            <CardDescription>Last 30 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigBar} className="min-h-[300px] w-full">
              <BarChart data={ingredientUsageData} layout="vertical" margin={{left: 10}}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" fill="var(--color-Rice)" radius={5}>
                    {ingredientUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfigBar[entry.name as keyof typeof chartConfigBar]?.color} />
                    ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meal Popularity</CardTitle>
            <CardDescription>Last 30 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigPie} className="min-h-[300px] w-full">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={mealPopularityData} dataKey="popularity" nameKey="meal" cx="50%" cy="50%" outerRadius={100}>
                        {mealPopularityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
