
'use client';

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
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { UnitOfMeasure } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UomActionsProps {
  uom: UnitOfMeasure;
}

export function UomActions({ uom }: UomActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UnitOfMeasure | null>(null);
  const { toast } = useToast();

  const handleEditClick = () => {
    setSelectedUom(uom);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setSelectedUom(uom);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUom = async () => {
    if (!selectedUom) return;

    try {
      const uomDocRef = doc(firestore, 'unitsOfMeasure', selectedUom.id);
      const { id, ...uomData } = selectedUom;
      await updateDoc(uomDocRef, uomData);
      toast({ title: "Success", description: "UOM updated successfully." });
      // In a real app with proper state management, you'd update the global state.
      // For now, we'll rely on a page refresh to see changes.
      window.location.reload();
    } catch (error) {
      console.error("Error updating UOM: ", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update UOM." });
    }

    setIsEditDialogOpen(false);
    setSelectedUom(null);
  };

  const handleDeleteUom = async () => {
    if (!selectedUom || !selectedUom.id) return;
    try {
      await deleteDoc(doc(firestore, 'unitsOfMeasure', selectedUom.id));
      toast({ title: "Success", description: "UOM deleted successfully." });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting UOM: ", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete UOM." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedUom(null);
  };

  const handleFieldChange = (field: keyof UnitOfMeasure, value: string) => {
    if (selectedUom) {
      setSelectedUom({ ...selectedUom, [field]: value });
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleEditClick}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDeleteClick}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit UOM</DialogTitle>
            <DialogDescription>
              Make changes to the unit of measure. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Abbreviation
              </Label>
              <Input
                id="name"
                value={selectedUom?.name || ''}
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
                value={selectedUom?.description || ''}
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
            <Button onClick={handleSaveUom}>Save changes</Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUom}
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
