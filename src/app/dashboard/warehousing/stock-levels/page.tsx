
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
import { collection, getDocs } from 'firebase/firestore';
import type { Ingredient, UnitOfMeasure, IngredientVariant } from '@/lib/types';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';

interface StockItem extends IngredientVariant {
  ingredientName: string;
  ingredientId: string;
  openingStock: number;
  received: number;
  issued: number;
  currentLevel: number;
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
        const [ingredientsSnap, uomSnap] = await Promise.all([
          getDocs(collection(firestore, 'ingredients')),
          getDocs(collection(firestore, 'unitsOfMeasure')),
        ]);

        const ingredientsData = ingredientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        const uomData = uomSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitOfMeasure));

        const flattenedStockItems: StockItem[] = ingredientsData.flatMap(ingredient =>
          ingredient.variants.map(variant => ({
            ...variant,
            ingredientName: ingredient.name,
            ingredientId: ingredient.id,
            openingStock: variant.stock, // Assuming initial stock is opening stock
            received: 0, // Placeholder
            issued: 0, // Placeholder
            currentLevel: variant.stock, // Placeholder
          }))
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
    const newStockItems = stockItems.map(item =>
      item.id === itemId
        ? { ...item, stock: Number(value), currentLevel: Number(value) } // Update stock and current level for now
        : item
    );
    setStockItems(newStockItems);
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
                <TableHead>Opening Stock</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Current Level</TableHead>
                <TableHead className="w-[120px]">Stocktake</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading stock levels...</TableCell>
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
                        defaultValue={item.stock}
                        onBlur={(e) => handleStocktakeChange(item.id, e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
               {!isLoading && stockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
