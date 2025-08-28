
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { MoreHorizontal, PlusCircle, X, Loader2 } from 'lucide-react';
import type { Category, UnitOfMeasure, IngredientVariant, RationScaleItem } from '@/lib/types';
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
import { collection, doc, addDoc, updateDoc, deleteDoc, arrayUnion, query, onSnapshot } from 'firebase/firestore';
import { getCategories, getUoms } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


type NewVariantState = {
  packagingSize: string;
  unitOfMeasureId: string;
};

type EditableIngredient = Omit<RationScaleItem, 'id'> & { id?: string };

export function IngredientsClientTable() {
  const [ingredients, setIngredients] = useState<RationScaleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteVariantDialogOpen, setIsDeleteVariantDialogOpen] = useState(false);
  
  // State for items to be actioned on
  const [selectedIngredient, setSelectedIngredient] = useState<EditableIngredient | RationScaleItem | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<{ingredientId: string, variant: IngredientVariant} | null>(null);
  const [ingredientToDelete, setIngredientToDelete] = useState<RationScaleItem | null>(null);
  
  // State for new variant form
  const [newVariant, setNewVariant] = useState<NewVariantState>({ packagingSize: '', unitOfMeasureId: '' });

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, uomData] = await Promise.all([
        getCategories(),
        getUoms(),
      ]);
      setCategories(categoriesData);
      setUnitsOfMeasure(uomData);

      const q = query(collection(firestore, 'rationScaleItems'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ingredientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RationScaleItem));
        setIngredients(ingredientsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching ingredients: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load ingredient data." });
        setIsLoading(false);
      });
      return unsubscribe;

    } catch (error) {
      console.error("Error fetching supporting data: ", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load categories or UOMs." });
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    fetchData().then(unsub => {
        if (unsub) {
          unsubscribe = unsub;
        }
    });
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}, [fetchData]);


  const getUomName = (uomId: string) => unitsOfMeasure.find((u) => u.id === uomId)?.name || 'N/A';
  const getCategoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name || 'N/A';

  const handleOpenIngredientDialog = (ingredient: RationScaleItem | null) => {
    if (ingredient) {
      setSelectedIngredient(ingredient);
    } else {
      setSelectedIngredient({ 
          name: '', 
          categoryId: '', 
          variants: [], 
          isActive: true, 
          kitchenId: 'all', 
          quantity: 0, 
          unitOfMeasureId: '' 
        });
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
        const ingredientRef = doc(firestore, 'rationScaleItems', selectedIngredient.id);
        const { id, ...dataToUpdate } = selectedIngredient;
        await updateDoc(ingredientRef, dataToUpdate);
        toast({ title: 'Success', description: 'Ingredient updated successfully.' });
      } else {
        // Add new ingredient
        await addDoc(collection(firestore, 'rationScaleItems'), selectedIngredient);
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
  
  const confirmDeleteIngredient = (ingredient: RationScaleItem) => {
    setIngredientToDelete(ingredient);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteIngredient = async () => {
    if (!ingredientToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(firestore, 'rationScaleItems', ingredientToDelete.id));
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

  const handleOpenAddVariantDialog = (ingredient: RationScaleItem) => {
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
    const ingredientRef = doc(firestore, 'rationScaleItems', selectedIngredient.id);
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
    const ingredientRef = doc(firestore, 'rationScaleItems', ingredientId);
    
    try {
      const ingredient = ingredients.find(i => i.id === ingredientId);
      if (!ingredient) throw new Error("Ingredient not found");
      const updatedVariants = ingredient.variants.filter(v => v.id !== variant.id);

      await updateDoc(ingredientRef, {
        variants: updatedVariants
      });
      
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
      const nameMatches = ingredient.name.toLowerCase().includes(nameFilter.toLowerCase());
      const categoryMatches = categoryFilter === 'all' || ingredient.categoryId === categoryFilter;
      return nameMatches && categoryMatches;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [ingredients, nameFilter, categoryFilter]);
  

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
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="gap-1"
          onClick={() => handleOpenIngredientDialog(null)}
          disabled={isLoading}
        >
          <PlusCircle className="h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md mt-4">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead className="w-[25%]">Category</TableHead>
              <TableHead>Packaging Options</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-1/2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
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
                    <div className="flex items-center justify-end">
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
                {filteredIngredients.length === 0 && !isLoading && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No ingredients found for the current filters.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    
      <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIngredient?.id ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
            <DialogDescription>
              {selectedIngredient?.id ? 'Update the details for this ingredient.' : 'Create a new ingredient for the catalogue.'}
            </DialogDescription>
          </DialogHeader>
        {selectedIngredient && <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={selectedIngredient.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={selectedIngredient.categoryId || ''} onValueChange={(value) => handleFieldChange('categoryId', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIngredientDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSaveIngredient} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Ingredient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
              <Button onClick={handleAddVariant} disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Option'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
