
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs } from 'firebase/firestore';
import type { RationScaleItem, Ingredient, Category, UnitOfMeasure } from '@/lib/types';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

export default function RationScalePage() {
  const [items, setItems] = useState<RationScaleItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rationScaleSnap, ingredientsSnap, categoriesSnap, uomSnap] = await Promise.all([
          getDocs(collection(firestore, 'rationScaleItems')), // Assuming 'rationScaleItems' is the collection name
          getDocs(collection(firestore, 'ingredients')),
          getDocs(collection(firestore, 'categories')),
          getDocs(collection(firestore, 'unitsOfMeasure')),
        ]);

        const rationScaleData = rationScaleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RationScaleItem));
        const ingredientsData = ingredientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        const categoriesData = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        const uomData = uomSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitOfMeasure));

        // Note: For now, we assume rationScaleItems are derived from ingredients.
        // This logic might need adjustment based on the actual data model for ration scales.
        // A more robust solution might involve a dedicated `rationScaleItems` collection.
        // For now, we'll map ingredients to ration scale items.
        const mappedRationScaleItems = ingredientsData.map(ing => ({
            id: ing.id,
            kitchenId: ing.kitchenId,
            name: ing.name,
            categoryId: ing.categoryId,
            quantity: 0, // Default quantity, should be fetched from rationScaleItems collection
            unitOfMeasureId: ing.variants[0]?.unitOfMeasureId || '', // Default UOM
            variants: ing.variants,
        }));
        
        // If rationScaleData is available, merge it with the mapped items
        const finalItems = mappedRationScaleItems.map(item => {
            const foundScale = rationScaleData.find(scale => scale.id === item.id);
            return foundScale ? { ...item, ...foundScale } : item;
        });

        setItems(finalItems);
        setIngredients(ingredientsData);
        setCategories(categoriesData);
        setUnitsOfMeasure(uomData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);


  const getIngredientInfo = (ingredientId: string) => {
    return ingredients.find(i => i.id === ingredientId) || { name: 'N/A', categoryId: '' };
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  }

  const handleQuantityChange = (itemId: string, value: string) => {
    // Replace comma with period for consistency
    const sanitizedValue = value.replace(/,/, '.');
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: Number(sanitizedValue) } : item
    );
    setItems(newItems);
  };
  
  const handleUomChange = (itemId: string, value: string) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, unitOfMeasureId: value } : item
    );
    setItems(newItems);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const ingredientInfo = getIngredientInfo(item.id);
      const categoryName = getCategoryName(ingredientInfo.categoryId).toLowerCase();
      const nameMatches = ingredientInfo.name.toLowerCase().includes(nameFilter.toLowerCase());
      const categoryMatches = categoryFilter === '' || categoryName.includes(categoryFilter.toLowerCase());
      return nameMatches && categoryMatches;
    });
  }, [items, nameFilter, categoryFilter, categories, ingredients]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ration Scale</CardTitle>
            <CardDescription>
              Manage the standard ration scale for each ingredient.
            </CardDescription>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-sm"
            />
            <Input
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-16rem)] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[180px]">UOM</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                ) : filteredItems.map((item) => {
                    const ingredientInfo = getIngredientInfo(item.id);
                    return (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{ingredientInfo.name}</TableCell>
                            <TableCell>
                            {getCategoryName(ingredientInfo.categoryId)}
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="text" // Change to text to handle comma replacement
                                    inputMode="decimal" // Provides numeric keyboard on mobile
                                    value={item.quantity} 
                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    className="w-full" 
                                />
                            </TableCell>
                            <TableCell>
                            <Select defaultValue={item.unitOfMeasureId} onValueChange={(value) => handleUomChange(item.id, value)}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select UOM" />
                                </SelectTrigger>
                                <SelectContent>
                                {unitsOfMeasure.map((uom) => (
                                    <SelectItem key={uom.id} value={uom.id}>
                                    {uom.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
