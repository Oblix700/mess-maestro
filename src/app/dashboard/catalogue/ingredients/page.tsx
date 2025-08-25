
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>
              Manage your ingredients and their variants.
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
              <TableHead>Variants</TableHead>
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
                        ? `${ingredient.variants.length} variant(s)`
                        : "No variants"
                    }
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Manage Variants</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Manage Variants for {ingredient.name}</DialogTitle>
                                <DialogDescription>
                                    Add, edit, or remove packaging variants for this ingredient.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Packaging Size</TableHead>
                                            <TableHead>UOM</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ingredient.variants.map(variant => (
                                            <TableRow key={variant.id}>
                                                <TableCell>{variant.packagingSize}</TableCell>
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
                                                <TableCell>{variant.stock}</TableCell>
                                                <TableCell>
                                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             <DialogFooter>
                                <Button size="sm" variant="outline" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    Add Variant
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
