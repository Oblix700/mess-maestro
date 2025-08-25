
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({ packagingSize: '', unitOfMeasureId: '' });


  const getUomName = (uomId: string) => {
    return unitsOfMeasure.find((u) => u.id === uomId)?.name || 'N/A';
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'N/A';
  }

  const handleOpenAddVariantDialog = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId);
    setNewVariant({ packagingSize: '', unitOfMeasureId: unitsOfMeasure[0]?.id || '' });
    setIsAddVariantDialogOpen(true);
  };
  
  const handleAddVariant = () => {
    if (!selectedIngredientId || !newVariant.packagingSize || !newVariant.unitOfMeasureId) return;

    setIngredients(ingredients.map(ing => {
      if (ing.id === selectedIngredientId) {
        const newVariantToAdd = {
          id: `v${Date.now()}`, // temporary unique ID
          packagingSize: newVariant.packagingSize,
          unitOfMeasureId: newVariant.unitOfMeasureId,
          stock: 0,
        };
        return {
          ...ing,
          variants: [...ing.variants, newVariantToAdd],
        };
      }
      return ing;
    }));

    setIsAddVariantDialogOpen(false);
    setSelectedIngredientId(null);
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

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const categoryName = getCategoryName(ingredient.categoryId).toLowerCase();
      const nameMatches = ingredient.name.toLowerCase().includes(nameFilter.toLowerCase());
      const categoryMatches = categoryName.includes(categoryFilter.toLowerCase());
      return nameMatches && categoryMatches;
    });
  }, [ingredients, nameFilter, categoryFilter]);
  

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
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[20%]">Category</TableHead>
                <TableHead>Packaging Options</TableHead>
                <TableHead className="w-[80px]">
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredIngredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>
                      {getCategoryName(ingredient.categoryId)}
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
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAddVariantDialog(ingredient.id)}>
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
        </div>
      </CardContent>
    </Card>

    {/* Add Variant Dialog */}
    <Dialog open={isAddVariantDialogOpen} onOpenChange={setIsAddVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Packaging Option</DialogTitle>
            <DialogDescription>
              Enter the size and unit of measure for the new packaging option.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packagingSize" className="text-right">
                Size (Qty)
              </Label>
              <Input
                id="packagingSize"
                type="number"
                value={newVariant.packagingSize}
                onChange={(e) => setNewVariant({ ...newVariant, packagingSize: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uom" className="text-right">
                UOM
              </Label>
              <Select
                value={newVariant.unitOfMeasureId}
                onValueChange={(value) => setNewVariant({ ...newVariant, unitOfMeasureId: value })}
              >
                <SelectTrigger className="col-span-3">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVariant}>Save Option</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
