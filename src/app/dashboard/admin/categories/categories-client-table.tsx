
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
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { Category } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface CategoriesClientTableProps {
    initialCategories: Category[];
}

export function CategoriesClientTable({ initialCategories }: CategoriesClientTableProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedCategory({ id: '', name: '', description: '' });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!selectedCategory || !selectedCategory.name) {
        toast({ variant: "destructive", title: "Validation Error", description: "Category name is required." });
        return;
    }
    setIsLoading(true);

    if (selectedCategory.id) {
        // Update existing category
        try {
            const categoryDocRef = doc(firestore, 'categories', selectedCategory.id);
            const { id, ...categoryData } = selectedCategory;
            await updateDoc(categoryDocRef, categoryData);
            setCategories(categories.map((r) => (r.id === selectedCategory.id ? selectedCategory : r)));
            toast({ title: "Success", description: "Category updated successfully." });
        } catch (error) {
            console.error("Error updating category: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update category." });
        }
    } else {
        // Add new category
        try {
            const { id, ...newCategoryData } = selectedCategory;
            const docRef = await addDoc(collection(firestore, 'categories'), newCategoryData);
            setCategories([...categories, { id: docRef.id, ...newCategoryData }]);
            toast({ title: "Success", description: "Category added successfully." });
        } catch (error) {
            console.error("Error adding category: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add category." });
        }
    }

    setIsLoading(false);
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !selectedCategory.id) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(firestore, 'categories', selectedCategory.id));
        setCategories(categories.filter((r) => r.id !== selectedCategory.id));
        toast({ title: "Success", description: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete category. It might be in use." });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleFieldChange = (field: keyof Omit<Category, 'id'>, value: string) => {
    if (selectedCategory) {
      setSelectedCategory({ ...selectedCategory, [field]: value });
    }
  };

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add Category
            </Button>
        </div>
      <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No categories found.</TableCell>
                </TableRow>
            ) : categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(category)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(category)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory?.id ? "Make changes to the category name and description." : 'Add a new category to the list.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={selectedCategory?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={selectedCategory?.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save changes'}
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
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
