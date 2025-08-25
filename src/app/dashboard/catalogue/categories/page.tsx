
'use client';

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
import React, { useState, useEffect } from 'react';
import type { Category } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesCollection = collection(firestore, 'categories');
        const querySnapshot = await getDocs(categoriesCollection);
        const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch categories from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

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
    if (!selectedCategory) return;
    
    if(selectedCategory.id) {
        try {
            const categoryDocRef = doc(firestore, 'categories', selectedCategory.id);
            const { id, ...categoryData } = selectedCategory;
            await updateDoc(categoryDocRef, categoryData);
            setCategories(categories.map((c) => (c.id === selectedCategory.id ? selectedCategory : c)));
            toast({ title: "Success", description: "Category updated successfully." });
        } catch (error) {
            console.error("Error updating category: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update category." });
        }
    } else {
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

    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !selectedCategory.id) return;
    try {
        await deleteDoc(doc(firestore, 'categories', selectedCategory.id));
        setCategories(categories.filter((c) => c.id !== selectedCategory.id));
        toast({ title: "Success", description: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete category." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleFieldChange = (field: keyof Category, value: string) => {
    if (selectedCategory) {
      setSelectedCategory({ ...selectedCategory, [field]: value });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Food Categories</CardTitle>
              <CardDescription>
                Manage your food categories. Add, edit, or delete them.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-20rem)] overflow-auto border rounded-md">
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="flex justify-end gap-2">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              Make changes to your category here. Click save when you're done.
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={selectedCategory?.description || ''}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
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
            <Button onClick={handleSaveCategory}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove its association from all ingredients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
