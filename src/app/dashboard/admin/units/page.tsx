
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
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import type { Unit } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addUnit, getUnits, updateUnit, deleteUnit, seedUnits } from '@/lib/services/unitService';
import { useToast } from '@/hooks/use-toast';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUnits = await getUnits();
      setUnits(fetchedUnits);
    } catch (error) {
      console.error('Failed to fetch units:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch units. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleAddNewClick = () => {
    setSelectedUnit({ unit: '', mess: '' });
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;

    try {
      if (selectedUnit.id) {
        await updateUnit(selectedUnit.id, selectedUnit);
        toast({ title: 'Success', description: 'Unit updated successfully.' });
      } else {
        await addUnit(selectedUnit);
        toast({ title: 'Success', description: 'Unit added successfully.' });
      }
      setIsFormDialogOpen(false);
      setSelectedUnit(null);
      fetchUnits(); // Refresh the list
    } catch (error) {
      console.error('Failed to save unit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the unit.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUnit || !selectedUnit.id) return;
    try {
      await deleteUnit(selectedUnit.id);
      toast({ title: 'Success', description: 'Unit deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
      fetchUnits(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete unit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the unit.',
      });
    }
  };

  const handleFieldChange = (field: keyof Omit<Unit, 'id'>, value: string) => {
    if (selectedUnit) {
      setSelectedUnit({ ...selectedUnit, [field]: value });
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedUnits();
      toast({ title: 'Success', description: 'Placeholder data has been added to the database.' });
      fetchUnits();
    } catch (error) {
      console.error('Failed to seed data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to seed placeholder data.',
      });
    } finally {
      setIsSeeding(false);
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
                Manage your kitchens and messes. Data is now read from and saved to Firestore.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={handleSeedData} disabled={isSeeding || units.length > 0} variant="outline">
                {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Seed Placeholder Data
              </Button>
              <Button size="sm" className="gap-1" onClick={handleAddNewClick}>
                <PlusCircle className="h-4 w-4" />
                Add Unit
              </Button>
            </div>
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
                  <TableCell colSpan={3} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : units.length > 0 ? (
                units.map((unit) => (
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
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    No units found. Click "Seed Placeholder Data" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUnit?.id ? 'Edit' : 'Add'} Unit</DialogTitle>
            <DialogDescription>
              {selectedUnit?.id ? 'Make changes to the unit.' : 'Add a new unit to the system.'} Click save when you're done.
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
              onClick={() => setIsFormDialogOpen(false)}
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
              onClick={handleDeleteConfirm}
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
