
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Pencil, PlusCircle, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import type { Dish } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface DishesClientTableProps {
    initialDishes: Dish[];
}

export function DishesClientTable({ initialDishes }: DishesClientTableProps) {
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [currentVariant, setCurrentVariant] = useState('');
  const { toast } = useToast();

  const handleEditClick = (dish: Dish) => {
    setSelectedDish({ ...dish, variants: dish.variants || [] });
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedDish({ id: '', kitchenId: 'all', name: '', description: '', variants: [], ingredients: [] });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveDish = async () => {
    if (!selectedDish || !selectedDish.name) {
        toast({ variant: "destructive", title: "Validation Error", description: "Dish name is required." });
        return;
    }
    setIsLoading(true);

    if (selectedDish.id) {
        try {
            const dishDocRef = doc(firestore, 'dishes', selectedDish.id);
            const { id, ...dishData } = selectedDish;
            await updateDoc(dishDocRef, dishData);
            setDishes(dishes.map((r) => (r.id === selectedDish.id ? selectedDish : r)));
            toast({ title: "Success", description: "Dish updated successfully." });
        } catch (error) {
            console.error("Error updating dish: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update dish." });
        }
    } else {
        try {
            const { id, ...newDishData } = selectedDish;
            const docRef = await addDoc(collection(firestore, 'dishes'), newDishData);
            setDishes([...dishes, { id: docRef.id, ...newDishData }]);
            toast({ title: "Success", description: "Dish added successfully." });
        } catch (error) {
            console.error("Error adding dish: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add dish." });
        }
    }

    setIsLoading(false);
    setIsEditDialogOpen(false);
    setSelectedDish(null);
  };

  const handleDeleteDish = async () => {
    if (!selectedDish || !selectedDish.id) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(firestore, 'dishes', selectedDish.id));
        setDishes(dishes.filter((r) => r.id !== selectedDish.id));
        toast({ title: "Success", description: "Dish deleted successfully." });
    } catch (error) {
        console.error("Error deleting dish: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete dish." });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedDish(null);
  };

  const handleFieldChange = (field: keyof Omit<Dish, 'id' | 'variants' | 'ingredients'>, value: string) => {
    if (selectedDish) {
      setSelectedDish({ ...selectedDish, [field]: value });
    }
  };

  const addVariant = () => {
    if (selectedDish && currentVariant && !selectedDish.variants.includes(currentVariant)) {
        const updatedVariants = [...(selectedDish.variants || []), currentVariant];
        setSelectedDish({...selectedDish, variants: updatedVariants});
        setCurrentVariant('');
    }
  };

  const removeVariant = (variantToRemove: string) => {
    if (selectedDish) {
        const updatedVariants = selectedDish.variants.filter(v => v !== variantToRemove);
        setSelectedDish({...selectedDish, variants: updatedVariants});
    }
  }


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1" onClick={handleAddClick}>
          <PlusCircle className="h-4 w-4" />
          Add Dish
        </Button>
      </div>
      <div className="relative overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {dishes.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No dishes found.</TableCell>
                </TableRow>
            ) : dishes.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell className="font-medium">{dish.name}</TableCell>
                <TableCell>{dish.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {dish.variants && dish.variants.length > 0 ? (
                      dish.variants.map((variant) => (
                        <Badge key={variant} variant="secondary">
                          {variant}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No variants</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(dish)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(dish)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDish?.id ? 'Edit Dish' : 'Add Dish'}</DialogTitle>
            <DialogDescription>
              {selectedDish?.id ? "Make changes to the dish details." : 'Add a new dish to the catalogue.'}
            </DialogDescription>
          </DialogHeader>
          {selectedDish && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Dish Name</Label>
                <Input id="name" value={selectedDish.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={selectedDish.description} onChange={(e) => handleFieldChange('description', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Variants</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Enter variant name" 
                        value={currentVariant} 
                        onChange={e => setCurrentVariant(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                    />
                    <Button type="button" onClick={addVariant}>Add Variant</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px]">
                    {selectedDish.variants && selectedDish.variants.length > 0 ? (
                        selectedDish.variants.map(variant => (
                             <Badge key={variant} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                                <span>{variant}</span>
                                <button 
                                onClick={() => removeVariant(variant)}
                                className="ml-1 rounded-full opacity-50 hover:opacity-100 hover:bg-destructive/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
                                >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove variant</span>
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <span className="text-sm text-muted-foreground p-2">No variants added.</span>
                    )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveDish} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Dish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              dish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDish}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
