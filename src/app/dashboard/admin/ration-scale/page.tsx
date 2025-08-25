
'use client';

import React, { useState } from 'react';
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
import { ingredients, categories, unitsOfMeasure, rationScaleItems } from '@/lib/placeholder-data';
import type { RationScaleItem } from '@/lib/types';

export default function RationScalePage() {
  const [items, setItems] = useState<RationScaleItem[]>(rationScaleItems);

  const getIngredientInfo = (ingredientId: string) => {
    return ingredients.find(i => i.id === ingredientId) || { name: 'N/A', categoryId: '' };
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: Number(value) } : item
    );
    setItems(newItems);
  };
  
  const handleUomChange = (itemId: string, value: string) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, unitOfMeasureId: value } : item
    );
    setItems(newItems);
  };

  // Although category is derived, this handler might be useful for future enhancements
  // For now, it won't be used as category is not directly editable here.

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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[120px]">Quantity</TableHead>
              <TableHead className="w-[180px]">UOM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
                const ingredientInfo = getIngredientInfo(item.id);
                return (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{ingredientInfo.name}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === ingredientInfo.categoryId)?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="number" 
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
                                {uom.name} ({uom.description})
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
      </CardContent>
    </Card>
  );
}
