
'use client';

import React, { useState, useMemo } from 'react';
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
import { ingredients, categories, unitsOfMeasure, rationScaleItems as initialRationScaleItems } from '@/lib/placeholder-data';
import type { RationScaleItem } from '@/lib/types';

export default function RationScalePage() {
  const [items, setItems] = useState<RationScaleItem[]>(initialRationScaleItems);
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
      const categoryMatches = categoryName.includes(categoryFilter.toLowerCase());
      return nameMatches && categoryMatches;
    });
  }, [items, nameFilter, categoryFilter]);

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
        <div className="relative h-[calc(100vh-22rem)] overflow-auto border rounded-md">
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
                {filteredItems.map((item) => {
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
