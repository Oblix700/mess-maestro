
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { FileDown, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIngredients, getUoms } from '@/lib/firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import { doc, writeBatch } from 'firebase/firestore';

interface StockItem extends IngredientVariant {
  ingredientName: string;
  ingredientId: string;
  isModified: boolean;
}

export default function StockLevelsPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ingredientsData, uomData] = await Promise.all([
        getIngredients(),
        getUoms(),
      ]);

      const flattenedStockItems: StockItem[] = ingredientsData.flatMap(ingredient =>
        (ingredient.variants || []).map(variant => ({
          ...variant,
          ingredientName: ingredient.name,
          ingredientId: ingredient.id,
          isModified: false,
        }))
      );

      flattenedStockItems.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
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
  }, [toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find(uom => uom.id === uomId)?.name || '';
  };

  const handleStocktakeChange = (variantId: string, value: string) => {
    const newStock = parseInt(value, 10);
    if (isNaN(newStock)) return;
    
    setStockItems(prevItems =>
      prevItems.map(item =>
        item.id === variantId
          ? { ...item, stock: newStock, isModified: true }
          : item
      )
    );
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const modifiedItems = stockItems.filter(item => item.isModified);
    if (modifiedItems.length === 0) {
      toast({ title: "No changes", description: "No stock levels were modified." });
      setIsSaving(false);
      return;
    }
    
    const batch = writeBatch(firestore);

    // This is inefficient. In a real app, we'd update only the variant,
    // not the entire ingredients array. This is a limitation of our current
    // data structure but we can still make it work.
    const ingredientsToUpdate = new Map<string, Ingredient>();
    
    // First, get the full documents for all ingredients that need updating.
    for (const item of modifiedItems) {
      if (!ingredientsToUpdate.has(item.ingredientId)) {
        const ingredientDoc = await getDoc(doc(firestore, 'ingredients', item.ingredientId));
        if (ingredientDoc.exists()) {
          ingredientsToUpdate.set(item.ingredientId, { id: ingredientDoc.id, ...ingredientDoc.data() } as Ingredient);
        }
      }
    }
    
    // Now, update the variants within those ingredient objects.
    for (const item of modifiedItems) {
        const ingredient = ingredientsToUpdate.get(item.ingredientId);
        if (ingredient) {
            const variantIndex = ingredient.variants.findIndex(v => v.id === item.id);
            if (variantIndex > -1) {
                ingredient.variants[variantIndex].stock = item.stock;
            }
        }
    }
    
    // Finally, write the updated ingredient objects back to the batch.
    ingredientsToUpdate.forEach((ingredient, id) => {
        const { id: docId, ...dataToUpdate } = ingredient;
        const ingredientRef = doc(firestore, 'ingredients', id);
        batch.update(ingredientRef, { variants: dataToUpdate.variants });
    });

    try {
      await batch.commit();
      toast({ title: "Success", description: "Stock levels updated successfully." });
      // Reset modification flags after saving
      setStockItems(prev => prev.map(item => ({ ...item, isModified: false })));
    } catch (error) {
      console.error("Error updating stock levels:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update stock levels." });
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex gap-2">
             <Button size="sm" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save Stocktake'}
             </Button>
            <Button size="sm" variant="outline" className="gap-1" disabled>
                <FileDown className="h-4 w-4" />
                Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[40%]">Ingredient & Packaging</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead className="w-[150px]">New Stocktake</TableHead>
                <TableHead>Discrepancy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading stock levels...</TableCell>
                </TableRow>
              ) : (
                stockItems.map(item => {
                  const originalStock = stockItems.find(si => si.id === item.id && !si.isModified)?.stock ?? item.stock;
                  const discrepancy = item.stock - originalStock;

                  return (
                    <TableRow key={item.id} className={cn(item.isModified && "bg-blue-50 dark:bg-blue-900/20")}>
                        <TableCell className="font-medium">
                        {item.ingredientName} - {item.packagingSize}{getUomName(item.unitOfMeasureId)}
                        </TableCell>
                        <TableCell>{originalStock}</TableCell>
                        <TableCell>
                        <Input
                            type="number"
                            defaultValue={item.stock}
                            onBlur={(e) => handleStocktakeChange(item.id, e.target.value)}
                            className="w-full"
                            placeholder="Enter count"
                        />
                        </TableCell>
                        <TableCell 
                        className={cn(
                            "font-medium",
                            discrepancy < 0 && "text-destructive",
                            discrepancy > 0 && "text-green-600"
                        )}
                        >
                        {discrepancy !== 0 ? discrepancy : "-"}
                        </TableCell>
                    </TableRow>
                  );
                })
              )}
               {!isLoading && stockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
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
