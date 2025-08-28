
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
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { UnitOfMeasure } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { doc, updateDoc, deleteDoc, setDoc, onSnapshot, query, collection, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function UomClientTable() {
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UnitOfMeasure | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(firestore, 'unitsOfMeasure'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const uomData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitOfMeasure));
        setUoms(uomData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching UOMs in real-time: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load UOMs."});
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEditClick = (uom: UnitOfMeasure) => {
    setSelectedUom(uom);
    setIsEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedUom({ id: '', name: '', description: '' });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (uom: UnitOfMeasure) => {
    setSelectedUom(uom);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUom = async () => {
    if (!selectedUom || !selectedUom.name) {
        toast({ variant: "destructive", title: "Validation Error", description: "UOM name (abbreviation) is required." });
        return;
    }
    setIsSubmitting(true);

    const isEditing = uoms.some(u => u.id === selectedUom.id);

    try {
      if (isEditing) {
          const uomDocRef = doc(firestore, 'unitsOfMeasure', selectedUom.id);
          const { id, ...uomData } = selectedUom;
          await updateDoc(uomDocRef, uomData);
          toast({ title: "Success", description: "UOM updated successfully." });
      } else {
          const newUomId = selectedUom.name.toLowerCase().replace(/\s+/g, '-');
          const { id, ...newUomData } = { ...selectedUom, id: newUomId };
          
          const uomDocRef = doc(firestore, 'unitsOfMeasure', newUomId);
          await setDoc(uomDocRef, newUomData);
          toast({ title: "Success", description: "UOM added successfully." });
      }
      setIsEditDialogOpen(false);
      setSelectedUom(null);
    } catch (error) {
      console.error("Error saving UOM: ", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save UOM." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUom = async () => {
    if (!selectedUom || !selectedUom.id) return;
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(firestore, 'unitsOfMeasure', selectedUom.id));
        toast({ title: "Success", description: "UOM deleted successfully." });
        setIsDeleteDialogOpen(false);
        setSelectedUom(null);
    } catch (error) {
        console.error("Error deleting UOM: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete UOM. It might be in use." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof Omit<UnitOfMeasure, 'id'>, value: string) => {
    if (selectedUom) {
      setSelectedUom({ ...selectedUom, [field]: value });
    }
  };


  return (
    <>
        <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add UOM
            </Button>
        </div>
      <div className="relative overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abbreviation</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                ))
            ) : uoms.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No UOMs found.</TableCell>
                </TableRow>
            ) : uoms.map((uom) => (
              <TableRow key={uom.id}>
                <TableCell className="font-medium">{uom.name}</TableCell>
                <TableCell>{uom.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(uom)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(uom)}
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
            <DialogTitle>{uoms.some(u => u.id === selectedUom?.id) ? 'Edit UOM' : 'Add UOM'}</DialogTitle>
            <DialogDescription>
              {uoms.some(u => u.id === selectedUom?.id) ? "Make changes to the unit of measure." : 'Add a new unit of measure to the list.'}
            </DialogDescription>
          </DialogHeader>
          {selectedUom && <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Abbreviation
              </Label>
              <Input
                id="name"
                value={selectedUom.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="col-span-3"
                disabled={uoms.some(u => u.id === selectedUom.id)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={selectedUom.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                className="col-span-3"
              />
            </div>
          </div>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUom} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save changes'}
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
              unit of measure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUom}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
