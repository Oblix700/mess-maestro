
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
import type { UnitOfMeasure } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function UomPage() {
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUom, setSelectedUom] = useState<UnitOfMeasure | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchUoms = async () => {
      setIsLoading(true);
      try {
        const uomCollection = collection(firestore, 'unitsOfMeasure');
        const querySnapshot = await getDocs(uomCollection);
        const uomData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitOfMeasure));
        setUoms(uomData);
      } catch (error) {
        console.error("Error fetching UOMs: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch units of measure from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUoms();
  }, [toast]);


  const handleEditClick = (uom: UnitOfMeasure) => {
    setSelectedUom(uom);
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedUom({ id: '', name: '', description: ''});
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (uom: UnitOfMeasure) => {
    setSelectedUom(uom);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUom = async () => {
    if (!selectedUom) return;

    if (selectedUom.id) { // Editing existing UOM
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
    } else { // Adding new UOM
        try {
            const { id, ...newUomData } = selectedUom;
            const docRef = await addDoc(collection(firestore, 'unitsOfMeasure'), newUomData);
            setUoms([...uoms, { id: docRef.id, ...newUomData }]);
            toast({ title: "Success", description: "UOM added successfully." });
        } catch (error) {
            console.error("Error adding UOM: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add UOM." });
        }
    }

    setIsEditDialogOpen(false);
    setSelectedUom(null);
  };

  const handleDeleteUom = async () => {
    if (!selectedUom || !selectedUom.id) return;
    try {
        await deleteDoc(doc(firestore, 'unitsOfMeasure', selectedUom.id));
        setUoms(uoms.filter((u) => u.id !== selectedUom.id));
        toast({ title: "Success", description: "UOM deleted successfully." });
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Units of Measure (UOM)</CardTitle>
              <CardDescription>
                Manage your units of measure for ingredients.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add UOM
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-20rem)] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Abbreviation</TableHead>
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUom?.id ? 'Edit UOM' : 'Add UOM'}</DialogTitle>
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

    