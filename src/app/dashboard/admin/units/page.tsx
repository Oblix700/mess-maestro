
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
import type { Unit } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoading(true);
      try {
        const unitsCollection = collection(firestore, 'units');
        const querySnapshot = await getDocs(unitsCollection);
        const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        setUnits(unitsData);
      } catch (error) {
        console.error("Error fetching units: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch units from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnits();
  }, [toast]);

  const handleEditClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedUnit({ unit: '', mess: '' }); // Prepare a new unit object
    setIsEditDialogOpen(true);
  }

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;
    
    // Distinguish between Add and Edit
    if (selectedUnit.id) {
        // Update existing unit
        try {
            const unitDocRef = doc(firestore, 'units', selectedUnit.id);
            const { id, ...unitData } = selectedUnit;
            await updateDoc(unitDocRef, unitData);
            setUnits(units.map((u) => (u.id === selectedUnit.id ? selectedUnit : u)));
            toast({ title: "Success", description: "Unit updated successfully." });
        } catch (error) {
            console.error("Error updating unit: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update unit." });
        }
    } else {
        // Add new unit
        try {
            const { id, ...newUnitData } = selectedUnit;
            const docRef = await addDoc(collection(firestore, 'units'), newUnitData);
            setUnits([...units, { id: docRef.id, ...newUnitData }]);
            toast({ title: "Success", description: "Unit added successfully." });
        } catch (error) {
            console.error("Error adding unit: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add unit." });
        }
    }
    
    setIsEditDialogOpen(false);
    setSelectedUnit(null);
  };


  const handleDeleteUnit = async () => {
    if (!selectedUnit || !selectedUnit.id) return;
    try {
        await deleteDoc(doc(firestore, 'units', selectedUnit.id));
        setUnits(units.filter((u) => u.id !== selectedUnit.id));
        toast({ title: "Success", description: "Unit deleted successfully." });
    } catch (error) {
        console.error("Error deleting unit: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete unit." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedUnit(null);
  };

  const handleFieldChange = (field: keyof Omit<Unit, 'id'>, value: string) => {
    if (selectedUnit) {
      setSelectedUnit({ ...selectedUnit, [field]: value });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Units</CardTitle>
              <CardDescription>
                Manage your kitchens and messes.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Mess</TableHead>
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
              ) : units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.unit}</TableCell>
                  <TableCell>{unit.mess}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(unit)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(unit)}
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
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUnit?.id ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
            <DialogDescription>
              {selectedUnit?.id ? 'Make changes to the unit. Click save when you\'re done.' : 'Add a new unit to the database.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Input
                id="unit"
                value={selectedUnit?.unit || ''}
                onChange={(e) => handleFieldChange('unit', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mess" className="text-right">
                Mess
              </Label>
              <Input
                id="mess"
                value={selectedUnit?.mess || ''}
                onChange={(e) => handleFieldChange('mess', e.target.value)}
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
            <Button onClick={handleSaveUnit}>Save changes</Button>
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
              unit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUnit}
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
