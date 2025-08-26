
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Ingredient, UnitOfMeasure, IngredientVariant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIngredients, getUoms } from '@/lib/firebase/firestore';


interface StockItem extends IngredientVariant {
  ingredientName: string;
  ingredientId: string;
  openingStock: number;
  received: number;
  issued: number;
  currentLevel: number;
  stocktake: number;
  discrepancy: number;
}

export default function StockLevelsPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ingredientsData, uomData] = await Promise.all([
          getIngredients(),
          getUoms(),
        ]);

        const flattenedStockItems: StockItem[] = ingredientsData.flatMap(ingredient =>
          ingredient.variants.map(variant => {
            const currentStock = variant.stock;
            return {
              ...variant,
              ingredientName: ingredient.name,
              ingredientId: ingredient.id,
              openingStock: currentStock, 
              received: 0, 
              issued: 0, 
              currentLevel: currentStock,
              stocktake: currentStock,
              discrepancy: 0,
            };
          })
        );

        setStockItems(flattenedStockItems);
        setUnitsOfMeasure(uomData);

      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch stock data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find(uom => uom.id === uomId)?.name || '';
  };

  const handleStocktakeChange = (itemId: string, value: string) => {
    const stocktakeValue = value === '' ? NaN : Number(value);
    setStockItems(stockItems.map(item => {
      if (item.id === itemId) {
        const newStocktake = isNaN(stocktakeValue) ? item.currentLevel : stocktakeValue;
        const discrepancy = newStocktake - item.currentLevel;
        return { 
          ...item, 
          stocktake: newStocktake,
          discrepancy: discrepancy,
        };
      }
      return item;
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stock Levels</CardTitle>
            <CardDescription>
              Manage and monitor ingredient stock levels in the warehouse.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-1">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[30%]">Ingredient & Packaging</TableHead>
                <TableHead>Opening</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Current</TableHead>
                <TableHead className="w-[120px]">Stocktake</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Corrected Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading stock levels...</TableCell>
                </TableRow>
              ) : (
                stockItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.ingredientName} - {item.packagingSize}{getUomName(item.unitOfMeasureId)}
                    </TableCell>
                    <TableCell>{item.openingStock}</TableCell>
                    <TableCell>{item.received}</TableCell>
                    <TableCell>{item.issued}</TableCell>
                    <TableCell>{item.currentLevel}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={item.stocktake}
                        onBlur={(e) => handleStocktakeChange(item.id, e.target.value)}
                        className="w-full"
                        placeholder="Enter count"
                      />
                    </TableCell>
                    <TableCell 
                      className={cn(
                        "font-medium",
                        item.discrepancy < 0 && "text-destructive",
                        item.discrepancy > 0 && "text-green-600"
                      )}
                    >
                      {item.discrepancy !== 0 ? item.discrepancy : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.discrepancy !== 0 ? item.stocktake : item.currentLevel}
                    </TableCell>
                  </TableRow>
                ))
              )}
               {!isLoading && stockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No ingredients found. Add ingredients in the Catalogue to manage stock.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
