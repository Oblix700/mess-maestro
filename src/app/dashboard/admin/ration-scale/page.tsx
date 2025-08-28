
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, doc, writeBatch, addDoc, updateDoc, deleteDoc, query, onSnapshot } from 'firebase/firestore';
import type { RationScaleItem, Category, UnitOfMeasure } from '@/lib/types';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { getCategories, getUoms } from '@/lib/firebase/firestore';
import { Loader2, Save, PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

interface RationScaleRow extends RationScaleItem {
  isModified?: boolean;
}

export default function RationScalePage() {
  const [items, setItems] = useState<RationScaleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedIngredient, setSelectedIngredient] = useState<RationScaleRow | null>(null);
  const [ingredientToDelete, setIngredientToDelete] = useState<RationScaleRow | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, uomData] = await Promise.all([
          getCategories(),
          getUoms(),
        ]);
        setCategories(categoriesData);
        setUnitsOfMeasure(uomData);
      } catch (error) {
        console.error("Error fetching supporting data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch categories or UOMs.",
        });
      }
    };
    fetchData();

    const q = query(collection(firestore, 'rationScaleItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rationScaleData = snapshot.docs.map(doc => {
        const data = doc.data() as RationScaleItem;
        return {
          ...data,
          id: doc.id,
          quantity: Number(data.quantity || 0),
          isActive: data.isActive !== false, // Default to true if undefined
          isModified: false,
        }
      });
      setItems(rationScaleData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching ration scale in real-time:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ration scale data.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleOpenIngredientDialog = (item: RationScaleRow | null) => {
    if (item) {
        setSelectedIngredient(item);
    } else {
        setSelectedIngredient({
            id: '',
            name: '',
            categoryId: categories[0]?.id || '',
            quantity: 0,
            unitOfMeasureId: unitsOfMeasure[0]?.id || '',
            kitchenId: 'all',
            variants: [],
            isActive: true,
        });
    }
    setIsIngredientDialogOpen(true);
  };
  
  const handleConfirmDelete = (item: RationScaleRow) => {
    setIngredientToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFieldChange = (itemId: string, field: 'quantity' | 'unitOfMeasureId' | 'isActive', value: string | number | boolean) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const originalItem = items.find(i => i.id === itemId);
          let isModified = true;
          
          if (field === 'quantity') {
            const numValue = Number(value);
            isModified = numValue !== originalItem?.quantity;
            return { ...item, [field]: numValue, isModified };
          }
          
          if (field === 'isActive') {
             isModified = value !== originalItem?.isActive;
          }
           if (field === 'unitOfMeasureId') {
             isModified = value !== originalItem?.unitOfMeasureId;
          }

          return { ...item, [field]: value, isModified: isModified || item.isModified };
        }
        return item;
      })
    );
  };

  const handleSaveChanges = async () => {
    const modifiedItems = items.filter(item => item.isModified);
    if (modifiedItems.length === 0) {
      toast({ title: "No changes to save." });
      return;
    }

    setIsSaving(true);
    const batch = writeBatch(firestore);

    modifiedItems.forEach(item => {
      const { isModified, ...itemData } = item;
      const itemRef = doc(firestore, 'rationScaleItems', item.id);
      batch.update(itemRef, {
        quantity: Number(itemData.quantity),
        unitOfMeasureId: itemData.unitOfMeasureId,
        isActive: itemData.isActive,
      });
    });

    try {
      await batch.commit();
      toast({ title: "Success", description: `${modifiedItems.length} item(s) updated successfully.` });
      setItems(prev => prev.map(item => ({ ...item, isModified: false })));
    } catch (error) {
      console.error("Error saving ration scale:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveIngredient = async () => {
    if (!selectedIngredient) return;

    const { name, categoryId } = selectedIngredient;
    if (!name || !categoryId) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Category are required.' });
        return;
    }
    
    setIsSaving(true);
    
    try {
        if (selectedIngredient.id) {
            const itemRef = doc(firestore, 'rationScaleItems', selectedIngredient.id);
            await updateDoc(itemRef, { name, categoryId });
            toast({ title: 'Success', description: 'Ingredient updated.' });
        } else { 
            const newItem: Omit<RationScaleItem, 'id'> = {
                name: selectedIngredient.name,
                categoryId: selectedIngredient.categoryId,
                quantity: 0,
                unitOfMeasureId: selectedIngredient.unitOfMeasureId,
                kitchenId: 'all',
                variants: [],
                dishIds: [],
                isActive: true,
            };
            await addDoc(collection(firestore, 'rationScaleItems'), newItem);
            toast({ title: 'Success', description: 'Ingredient added.' });
        }
        setIsIngredientDialogOpen(false);
        setSelectedIngredient(null);
    } catch(e) {
        console.error("Error saving ingredient", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save ingredient.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteIngredient = async () => {
    if (!ingredientToDelete) return;
    
    setIsSaving(true);
    try {
        await deleteDoc(doc(firestore, 'rationScaleItems', ingredientToDelete.id));
        toast({ title: 'Success', description: 'Ingredient deleted.' });
        setIsDeleteDialogOpen(false);
        setIngredientToDelete(null);
    } catch(e) {
        console.error("Error deleting ingredient", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete ingredient.' });
    } finally {
        setIsSaving(false);
    }
  }


  const hasChanges = useMemo(() => items.some(item => item.isModified), [items]);

  const itemsByCategory = useMemo(() => {
    const grouped: { [key: string]: RationScaleRow[] } = {};
    items.forEach(item => {
      const categoryId = item.categoryId || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });
    for (const categoryId in grouped) {
      grouped[categoryId].sort((a, b) => a.name.localeCompare(b.name));
    }
    return grouped;
  }, [items]);

  const sortedCategoryIds = useMemo(() => {
    return Object.keys(itemsByCategory).sort((a, b) => {
      const catA = categories.find(c => c.id === a)?.name || a;
      const catB = categories.find(c => c.id === b)?.name || b;
      return catA.localeCompare(catB);
    });
  }, [categories, itemsByCategory]);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ration Scale Management</CardTitle>
              <CardDescription>
                Manage ingredients, their status, and their standard ration scale.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenIngredientDialog(null)} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Ingredient
                </Button>
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[80px]">Active</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Quantity</TableHead>
                  <TableHead className="w-[180px]">UOM</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : sortedCategoryIds.length > 0 ? (
                  sortedCategoryIds.map(categoryId => (
                    <React.Fragment key={categoryId}>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={5} className="font-bold text-primary sticky left-0 bg-muted/50">
                          {getCategoryName(categoryId)}
                        </TableCell>
                      </TableRow>
                      {itemsByCategory[categoryId].map(item => (
                        <TableRow key={item.id} className={cn(item.isModified && "bg-blue-50 dark:bg-blue-900/20", !item.isActive && "text-muted-foreground bg-gray-50 dark:bg-gray-900/30")}>
                           <TableCell>
                            <Switch
                                checked={item.isActive}
                                onCheckedChange={(checked) => handleFieldChange(item.id, 'isActive', checked)}
                                aria-label="Toggle active status"
                             />
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              defaultValue={Number(item.quantity || 0).toFixed(3)}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string or valid decimal format
                                if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
                                   handleFieldChange(item.id, 'quantity', value === '' ? '0' : value);
                                }
                              }}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue={item.unitOfMeasureId} onValueChange={(value) => handleFieldChange(item.id, 'unitOfMeasureId', value)}>
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleOpenIngredientDialog(item)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit Name/Category</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleConfirmDelete(item)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete Ingredient</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No ration scale items found. Use "Add Ingredient" to start.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedIngredient?.id ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
                <DialogDescription>
                    Manage the ingredient's core details. Ration quantity is set on the main page.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={selectedIngredient?.name || ''} onChange={(e) => setSelectedIngredient(prev => prev ? {...prev, name: e.target.value} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select value={selectedIngredient?.categoryId || ''} onValueChange={(value) => setSelectedIngredient(prev => prev ? {...prev, categoryId: value} : null)}>
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
                <Button variant="outline" onClick={() => setIsIngredientDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSaveIngredient} disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Ingredient'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the ingredient <span className="font-semibold">{ingredientToDelete?.name}</span> and remove it from all menus.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIngredientToDelete(null)} disabled={isSaving}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteIngredient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
