
'use client';

import React, { useState, useMemo } from 'react';
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
  DropdownMenuSeparator,
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
import type { Ingredient, Category, UnitOfMeasure, IngredientVariant } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Define a type for the new variant state
type NewVariantState = {
  packagingSize: string;
  unitOfMeasureId: string;
};

// Define a type for the ingredient being edited/added
type EditableIngredient = Omit<Ingredient, 'id'> & { id?: string };

interface IngredientsClientTableProps {
    initialIngredients: Ingredient[];
    initialCategories: Category[];
    initialUoms: UnitOfMeasure[];
}


export function IngredientsClientTable({ initialIngredients, initialCategories, initialUoms }: IngredientsClientTableProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [categories] = useState<Category[]>(initialCategories);
  const [unitsOfMeasure] = useState<UnitOfMeasure[]>(initialUoms);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteVariantDialogOpen, setIsDeleteVariantDialogOpen] = useState(false);
  
  // State for items to be actioned on
  const [selectedIngredient, setSelectedIngredient] = useState<EditableIngredient | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<{ingredientId: string, variant: IngredientVariant} | null>(null);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  
  // State for new variant form
  const [newVariant, setNewVariant] = useState<NewVariantState>({ packagingSize: '', unitOfMeasureId: '' });

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { toast } = useToast();

  const getUomName = (uomId: string) => unitsOfMeasure.find((u) => u.id === uomId)?.name || 'N/A';
  const getCategoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name || 'N/A';

  const handleOpenIngredientDialog = (ingredient: Ingredient | null) => {
    if (ingredient) {
      setSelectedIngredient(ingredient);
    } else {
      setSelectedIngredient({ kitchenId: 'all', name: '', categoryId: '', variants: [] });
    }
    setIsIngredientDialogOpen(true);
  };

  const handleSaveIngredient = async () => {
    if (!selectedIngredient || !selectedIngredient.name || !selectedIngredient.categoryId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Category are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedIngredient.id) {
        // Update existing ingredient
        const ingredientRef = doc(firestore, 'ingredients', selectedIngredient.id);
        const { id, ...dataToUpdate } = selectedIngredient;
        await updateDoc(ingredientRef, dataToUpdate);
        setIngredients(ingredients.map(ing => ing.id === id ? { ...dataToUpdate, id } : ing));
        toast({ title: 'Success', description: 'Ingredient updated successfully.' });
      } else {
        // Add new ingredient
        const docRef = await addDoc(collection(firestore, 'ingredients'), selectedIngredient);
        setIngredients([...ingredients, { id: docRef.id, ...selectedIngredient }]);
        toast({ title: 'Success', description: 'Ingredient added successfully.' });
      }
      setIsIngredientDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save ingredient.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const confirmDeleteIngredient = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteIngredient = async () => {
    if (!ingredientToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(firestore, 'ingredients', ingredientToDelete.id));
      setIngredients(ingredients.filter(ing => ing.id !== ingredientToDelete.id));
      toast({ title: 'Success', description: 'Ingredient deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setIngredientToDelete(null);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete ingredient.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleOpenAddVariantDialog = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setNewVariant({ packagingSize: '', unitOfMeasureId: unitsOfMeasure[0]?.id || '' });
    setIsAddVariantDialogOpen(true);
  };

  const handleAddVariant = async () => {
    if (!selectedIngredient?.id || !newVariant.packagingSize || !newVariant.unitOfMeasureId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Packaging size and UOM are required.' });
      return;
    }
    setIsSubmitting(true);
    const ingredientRef = doc(firestore, 'ingredients', selectedIngredient.id);
    const newVariantToAdd: IngredientVariant = {
      id: `v${Date.now()}`,
      packagingSize: newVariant.packagingSize,
      unitOfMeasureId: newVariant.unitOfMeasureId,
      stock: 0,
    };

    try {
      await updateDoc(ingredientRef, {
        variants: arrayUnion(newVariantToAdd)
      });
      setIngredients(ingredients.map(ing => 
        ing.id === selectedIngredient.id 
          ? { ...ing, variants: [...ing.variants, newVariantToAdd] } 
          : ing
      ));
      toast({ title: 'Success', description: 'Packaging option added.' });
      setIsAddVariantDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error) {
      console.error('Error adding variant:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add packaging option.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteVariant = (ingredientId: string, variant: IngredientVariant) => {
    setVariantToDelete({ ingredientId, variant });
    setIsDeleteVariantDialogOpen(true);
  };
  
  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;
    const { ingredientId, variant } = variantToDelete;
    setIsSubmitting(true);
    const ingredientRef = doc(firestore, 'ingredients', ingredientId);
    
    try {
      await updateDoc(ingredientRef, {
        variants: arrayRemove(variant)
      });
      setIngredients(ingredients.map(ing => 
        ing.id === ingredientId 
          ? { ...ing, variants: ing.variants.filter(v => v.id !== variant.id) } 
          : ing
      ));
      toast({ title: 'Success', description: 'Packaging option removed.' });
      setIsDeleteVariantDialogOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove packaging option.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof EditableIngredient, value: string) => {
    if (selectedIngredient) {
      setSelectedIngredient({ ...selectedIngredient, [field]: value });
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const categoryName = getCategoryName(ingredient.categoryId).toLowerCase();
      const nameMatches = ingredient.name.toLowerCase().includes(nameFilter.toLowerCase());
      const categoryMatches = categoryFilter === 'all' || categoryName.toLowerCase().includes(categoryFilter.toLowerCase());
      return nameMatches && categoryMatches;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [ingredients, nameFilter, categoryFilter, categories]);
  

  return (
    <>
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Input
            placeholder="Filter by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <Button size="sm" className="gap-1" onClick={() => handleOpenIngredientDialog(null)}>
            <PlusCircle className="h-4 w-4" />
            Add Ingredient
        </Button>
    </div>
        
    <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md mt-4">
        <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="w-[20%]">Category</TableHead>
            <TableHead>Packaging Options</TableHead>
            <TableHead>
                <span className="sr-only">Actions</span>
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {ingredients.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
            ) : filteredIngredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>
                    {getCategoryName(ingredient.categoryId)}
                </TableCell>
                <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                        {ingredient.variants && ingredient.variants.length > 0 ? (
                            ingredient.variants.map((variant) => (
                                <Badge key={variant.id} variant="secondary" className="group pl-3 pr-1 py-1 text-sm">
                                    <span>{variant.packagingSize}{getUomName(variant.unitOfMeasureId)}</span>
                                    <button 
                                    onClick={() => confirmDeleteVariant(ingredient.id, variant)}
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
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAddVariantDialog(ingredient)}>
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
                            <DropdownMenuItem onClick={() => handleOpenIngredientDialog(ingredient)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => confirmDeleteIngredient(ingredient)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
            </TableRow>
            ))}
                {ingredients.length > 0 && filteredIngredients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No ingredients found for the current filters.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
        </Table>
    </div>
    
    {/* Add/Edit Ingredient Dialog */}
    <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedIngredient?.id ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
          <DialogDescription>
            {selectedIngredient?.id ? 'Update the details for this ingredient.' : 'Create a new ingredient for the catalogue.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={selectedIngredient?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={selectedIngredient?.categoryId || ''} onValueChange={(value) => handleFieldChange('categoryId', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsIngredientDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSaveIngredient} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Ingredient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    {/* Add Variant Dialog */}
    <Dialog open={isAddVariantDialogOpen} onOpenChange={setIsAddVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Packaging Option</DialogTitle>
            <DialogDescription>
              Enter the size and unit of measure for the new packaging option for <span className="font-semibold">{selectedIngredient?.name}</span>.
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
            <Button variant="outline" onClick={() => setIsAddVariantDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddVariant} disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Option'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Delete Ingredient Confirmation */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the ingredient <span className="font-semibold">{ingredientToDelete?.name}</span> and all its variants.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIngredientToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteIngredient} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Delete Variant Confirmation */}
    <AlertDialog open={isDeleteVariantDialogOpen} onOpenChange={setIsDeleteVariantDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this packaging size. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVariantToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
