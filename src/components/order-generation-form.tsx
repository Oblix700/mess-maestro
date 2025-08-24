"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SuggestPackagingBreakdownsInput,
  SuggestPackagingBreakdownsOutput,
  suggestPackagingBreakdowns,
} from "@/ai/flows/suggest-packaging-breakdowns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { ingredients } from "@/lib/placeholder-data";

const formSchema = z.object({
  headcount: z.coerce.number().min(1, "Headcount must be at least 1."),
  dayRange: z.string().min(1, "Day range is required."),
});

type FormValues = z.infer<typeof formSchema>;

// Mock order items for demonstration
const mockOrderItems: SuggestPackagingBreakdownsInput["orderItems"] = [
  { ingredient: "Chicken Breast", quantity: 20, unitOfMeasure: "kg" },
  { ingredient: "Potato", quantity: 50, unitOfMeasure: "kg" },
  { ingredient: "Carrot", quantity: 15, unitOfMeasure: "kg" },
  { ingredient: "Rice", quantity: 40, unitOfMeasure: "kg" },
];

export function OrderGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [packagingSuggestions, setPackagingSuggestions] = useState<
    SuggestPackagingBreakdownsOutput["packagingSuggestions"] | null
  >(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headcount: 100,
      dayRange: "1-7",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setPackagingSuggestions(null);
    try {
      const input: SuggestPackagingBreakdownsInput = {
        orderItems: mockOrderItems.map(item => ({
            ...item,
            quantity: item.quantity * (values.headcount / 100) // Adjust quantity by headcount for demo
        })),
        preferences: "Use eco-friendly bags for vegetables. Vacuum seal meats.",
      };
      
      const result = await suggestPackagingBreakdowns(input);
      setPackagingSuggestions(result.packagingSuggestions);
    } catch (error) {
      console.error("Failed to get packaging suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Could not generate packaging suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Generate New Order</CardTitle>
            <CardDescription>
              Specify parameters to generate a procurement order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="headcount">Headcount</Label>
                <Input
                  id="headcount"
                  type="number"
                  {...form.register("headcount")}
                />
                {form.formState.errors.headcount && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.headcount.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dayRange">Day Range</Label>
                <Input
                  id="dayRange"
                  type="text"
                  {...form.register("dayRange")}
                />
                {form.formState.errors.dayRange && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dayRange.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Order & Suggest Packaging"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Packaging Suggestions
          </CardTitle>
          <CardDescription>
            Optimal packaging based on your order to minimize waste.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Generating suggestions...</p>
            </div>
          )}
          {!isLoading && !packagingSuggestions && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Suggestions will appear here after generating an order.</p>
            </div>
          )}
          {packagingSuggestions && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packagingSuggestions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.ingredient}</TableCell>
                    <TableCell>{item.packagingType}</TableCell>
                    <TableCell>{`${item.quantity} ${item.unitOfMeasure}`}</TableCell>
                    <TableCell>{item.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
