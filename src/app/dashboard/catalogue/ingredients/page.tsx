
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { ingredients as initialIngredients, categories, unitsOfMeasure } from '@/lib/placeholder-data';
import type { Ingredient } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };
  
  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find((u) => u.id === uomId)?.name || 'N/A';
  }

  // A simple handler to add a new empty variant to an ingredient
  const handleAddVariant = (ingredientId: string) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === ingredientId) {
        const newVariant = {
          id: `v${Date.now()}`, // temporary unique ID
          packagingSize: '',
          unitOfMeasureId: unitsOfMeasure[0]?.id || '',
          stock: 0, // Not displayed, but kept for data consistency
        };
        return {
          ...ing,
          variants: [...ing.variants, newVariant],
        };
      }
      return ing;
    }));
  };

  // A simple handler to remove a variant from an ingredient
  const handleDeleteVariant = (ingredientId: string, variantId: string) => {
     setIngredients(ingredients.map(ing => {
      if (ing.id === ingredientId) {
        return {
          ...ing,
          variants: ing.variants.filter(v => v.id !== variantId),
        };
      }
      return ing;
    }));
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>
              Manage your ingredients and their packaging sizes.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Packaging Options</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>
                  <Select defaultValue={ingredient.categoryId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                    {ingredient.variants.length > 0 
                        ? `${ingredient.variants.length} option(s)`
                        : "No options"
                    }
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Manage Packaging</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Manage Packaging for {ingredient.name}</DialogTitle>
                                <DialogDescription>
                                    Add, edit, or remove packaging sizes for this ingredient.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Packaging Size</TableHead>
                                            <TableHead>UOM</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ingredient.variants.map(variant => (
                                            <TableRow key={variant.id}>
                                                <TableCell>
                                                    <Input type="text" defaultValue={variant.packagingSize} placeholder="e.g., 30" />
                                                </TableCell>
                                                <TableCell>
                                                    <Select defaultValue={variant.unitOfMeasureId}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select UOM" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {unitsOfMeasure.map(uom => (
                                                                <SelectItem key={uom.id} value={uom.id}>{uom.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteVariant(ingredient.id, variant.id)}>
                                                      <Trash2 className="h-4 w-4" />
                                                      <span className="sr-only">Delete</span>
                                                  </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <DialogFooter>
                                <Button size="sm" variant="outline" className="gap-1" onClick={() => handleAddVariant(ingredient.id)}>
                                    <PlusCircle className="h-4 w-4" />
                                    Add New Size
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
