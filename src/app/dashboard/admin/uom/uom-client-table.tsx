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
import type { UnitOfMeasure } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UomClientTableProps {
    initialUoms: UnitOfMeasure[];
}

export function UomClientTable({ initialUoms }: UomClientTableProps) {
  const [uoms, setUoms] = useState<UnitOfMeasure[]>(initialUoms);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UnitOfMeasure | null>(null);
  const { toast } = useToast();

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
    setIsLoading(true);

    const isEditing = uoms.some(u => u.id === selectedUom.id);

    if (isEditing) {
        // Update existing UOM
        try {
            const uomDocRef = doc(firestore, 'unitsOfMeasure', selectedUom.id);
            const { id, ...uomData } = selectedUom;
            await updateDoc(uomDocRef, uomData);
            setUoms(uoms.map((u) => (u.id === selectedUom.id ? selectedUom : u)));
            toast({ title: "Success", description: "UOM updated successfully." });
        } catch (error) {
            console.error("Error updating UOM: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update UOM." });
        }
    } else {
        // Add new UOM
        try {
            const newUomId = selectedUom.name.toLowerCase().replace(/\s+/g, '-');
            const { id, ...newUomData } = selectedUom;
            
            const uomDocRef = doc(firestore, 'unitsOfMeasure', newUomId);
            await setDoc(uomDocRef, newUomData);
            
            setUoms([...uoms, { ...newUomData, id: newUomId }]);
            toast({ title: "Success", description: "UOM added successfully." });
        } catch (error) {
            console.error("Error adding UOM: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add UOM." });
        }
    }

    setIsLoading(false);
    setIsEditDialogOpen(false);
    setSelectedUom(null);
  };

  const handleDeleteUom = async () => {
    if (!selectedUom || !selectedUom.id) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(firestore, 'unitsOfMeasure', selectedUom.id));
        setUoms(uoms.filter((u) => u.id !== selectedUom.id));
        toast({ title: "Success", description: "UOM deleted successfully." });
    } catch (error) {
        console.error("Error deleting UOM: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete UOM. It might be in use." });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedUom(null);
  };

  const handleFieldChange = (field: keyof Omit<UnitOfMeasure, 'id'>, value: string) => {
    if (selectedUom) {
      const newUom = { ...selectedUom, [field]: value };
      if (field === 'name' && !selectedUom.id) {
        newUom.id = value.toLowerCase().replace(/\s+/g, '-');
      }
      setSelectedUom(newUom);
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
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uoms.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No UOMs found.</TableCell>
                </TableRow>
            ) : uoms.map((uom) => (
              <TableRow key={uom.id}>
                <TableCell className="font-medium">{uom.name}</TableCell>
                <TableCell>{uom.description}</TableCell>
                <TableCell>
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
                disabled={uoms.some(u => u.id === selectedUom?.id)}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUom} disabled={isLoading}>
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
              unit of measure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUom}
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
