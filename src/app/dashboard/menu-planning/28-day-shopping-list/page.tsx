
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Ingredient, Category, UnitOfMeasure, RationScaleItem, MenuDefinition, MenuPlanItem } from '@/lib/types';
import { getIngredients, getCategories, getUoms, getRationScale } from '@/lib/firebase/firestore';
import { menuCycle as initialMenuCycle } from '@/lib/data/menu-cycle-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface CalculatedItem {
  ingredientId: string;
  name: string;
  uom: string;
  categoryId: string;
  dailyTotals: number[];
  total: number;
}

export default function TwentyEightDayShoppingListPage() {
  const [calculatedList, setCalculatedList] = useState<CalculatedItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const calculateShoppingList = async () => {
      setIsLoading(true);
      try {
        const [ingredients, categoriesData, uoms, rationScaleItems] = await Promise.all([
          getIngredients(),
          getCategories(),
          getUoms(),
          getRationScale(),
        ]);
        
        setCategories(categoriesData);

        const uomMap = new Map(uoms.map(u => [u.id, u.name]));
        const rationScaleMap = new Map(rationScaleItems.map(item => [item.id, item]));

        const shoppingListMap = new Map<string, CalculatedItem>();

        // Initialize all ingredients in the map
        ingredients.forEach(ing => {
          // Find the primary unit of measure from the first variant if available
          const primaryVariantUomId = ing.variants[0]?.unitOfMeasureId;
          const uomName = primaryVariantUomId ? uomMap.get(primaryVariantUomId) || 'N/A' : 'N/A';

          shoppingListMap.set(ing.id, {
            ingredientId: ing.id,
            name: ing.name,
            uom: uomName,
            categoryId: ing.categoryId,
            dailyTotals: Array(28).fill(0),
            total: 0,
          });
        });

        // Process each day in the menu cycle
        initialMenuCycle.forEach(menuDay => {
          const dayIndex = menuDay.day - 1;

          menuDay.sections.forEach(section => {
            section.items.forEach(item => {
              if (item.ingredientId) {
                const rationScaleItem = rationScaleMap.get(item.ingredientId);
                const shoppingListItem = shoppingListMap.get(item.ingredientId);

                if (rationScaleItem && shoppingListItem) {
                  const requiredAmount = rationScaleItem.quantity * (item.strength / 100);
                  shoppingListItem.dailyTotals[dayIndex] += requiredAmount;
                }
              }
            });
          });
        });

        // Finalize totals
        shoppingListMap.forEach(item => {
          item.total = item.dailyTotals.reduce((acc, val) => acc + val, 0);
        });
        
        const sortedList = Array.from(shoppingListMap.values()).sort((a,b) => a.name.localeCompare(b.name));
        setCalculatedList(sortedList);

      } catch (error) {
        console.error("Error calculating shopping list:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate the shopping list.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateShoppingList();
  }, [toast]);

  const itemsByCategory = useMemo(() => {
    const grouped: { [key: string]: CalculatedItem[] } = {};
    calculatedList.forEach(item => {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = [];
      }
      grouped[item.categoryId].push(item);
    });
    return grouped;
  }, [calculatedList]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>28-Day Shopping List</CardTitle>
        <CardDescription>
          Aggregated shopping list based on the 28-day menu cycle template. Values are calculated as (Ration Scale Qty &times; Strength %).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="sticky left-0 bg-card min-w-[250px]">Ingredient</TableHead>
                <TableHead className="min-w-[80px]">UOM</TableHead>
                {Array.from({ length: 28 }, (_, i) => (
                  <TableHead key={i} className="text-center min-w-[60px]">{i + 1}</TableHead>
                ))}
                <TableHead className="text-right min-w-[100px] sticky right-0 bg-card font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="sticky left-0 bg-card"><Skeleton className="h-5 w-4/5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    {Array.from({ length: 29 }).map((_, j) => (
                       <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories.map(category => (
                itemsByCategory[category.id] && (
                  <React.Fragment key={category.id}>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={31} className="font-bold text-primary sticky left-0 bg-muted/50">
                        {category.name}
                      </TableCell>
                    </TableRow>
                    {itemsByCategory[category.id].map(item => (
                      <TableRow key={item.ingredientId}>
                        <TableCell className="font-medium sticky left-0 bg-card">{item.name}</TableCell>
                        <TableCell>{item.uom}</TableCell>
                        {item.dailyTotals.map((total, dayIndex) => (
                          <TableCell key={dayIndex} className="text-center font-mono text-xs">
                            {total > 0 ? total.toFixed(3) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-mono sticky right-0 bg-card font-bold">
                           {item.total > 0 ? item.total.toFixed(3) : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                )
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

