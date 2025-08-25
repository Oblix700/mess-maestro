
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
import { MoreHorizontal, PlusCircle, X } from 'lucide-react';
import { ingredients as initialIngredients, categories, unitsOfMeasure } from '@/lib/placeholder-data';
import type { Ingredient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ingredientId: string, variantId: string} | null>(null);

  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find((u) => u.id === uomId)?.name || 'N/A';
  }

  const handleAddVariant = (ingredientId: string) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === ingredientId) {
        const newVariant = {
          id: `v${Date.now()}`, // temporary unique ID
          packagingSize: '1', // Default size
          unitOfMeasureId: unitsOfMeasure[0]?.id || '',
          stock: 0,
        };
        return {
          ...ing,
          variants: [...ing.variants, newVariant],
        };
      }
      return ing;
    }));
  };

  const confirmDeleteVariant = (ingredientId: string, variantId: string) => {
    setItemToDelete({ ingredientId, variantId });
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteVariant = () => {
    if (!itemToDelete) return;
    const { ingredientId, variantId } = itemToDelete;

    setIngredients(ingredients.map(ing => {
      if (ing.id === ingredientId) {
        return {
          ...ing,
          variants: ing.variants.filter(v => v.id !== variantId),
        };
      }
      return ing;
    }));
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
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
              <TableHead className="w-[50%]">Packaging Options</TableHead>
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
                    <div className="flex flex-wrap items-center gap-2">
                        {ingredient.variants.length > 0 ? (
                            ingredient.variants.map((variant) => (
                                <Badge key={variant.id} variant="secondary" className="group pl-3 pr-1 py-1 text-sm">
                                    <span>{variant.packagingSize}{getUomName(variant.unitOfMeasureId)}</span>
                                    <button 
                                      onClick={() => confirmDeleteVariant(ingredient.id, variant.id)}
                                      className="ml-1 rounded-full opacity-50 hover:opacity-100 hover:bg-destructive/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                      <span className="sr-only">Remove size</span>
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-sm">No options</span>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddVariant(ingredient.id)}>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only">Add size</span>
                        </Button>
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
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

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this packaging size. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
