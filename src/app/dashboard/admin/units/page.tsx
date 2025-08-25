
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
import React, { useState, useEffect } from 'react';
import type { Unit } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addUnit, deleteUnit, getUnits, updateUnit } from '@/services/unitService';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { toast } = useToast();

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const fetchedUnits = await getUnits();
      setUnits(fetchedUnits);
    } catch (error) {
      console.error('Failed to fetch units:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load units from the database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

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
    setIsFormSubmitting(true);
    try {
      if (selectedUnit.id) {
        await updateUnit(selectedUnit.id, selectedUnit);
        toast({ title: 'Success', description: 'Unit updated successfully.' });
      } else {
        await addUnit(selectedUnit);
        toast({ title: 'Success', description: 'Unit added successfully.' });
      }
      await fetchUnits(); // Refresh data
      setIsFormDialogOpen(false);
      setSelectedUnit(null);
    } catch (error) {
        console.error('Failed to save unit:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to save the unit. Please try again.',
        });
    } finally {
        setIsFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUnit || !selectedUnit.id) return;
    setIsDeleteSubmitting(true);
    try {
        await deleteUnit(selectedUnit.id);
        toast({ title: 'Success', description: 'Unit deleted successfully.' });
        await fetchUnits(); // Refresh data
        setIsDeleteDialogOpen(false);
        setSelectedUnit(null);
    } catch (error) {
        console.error('Failed to delete unit:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete the unit. Please try again.',
        });
    } finally {
        setIsDeleteSubmitting(false);
    }
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
            <div className="flex items-center gap-2">
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
                  <TableCell colSpan={3} className="text-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <span>Loading units...</span>
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
                  <TableCell colSpan={3} className="text-center h-24">
                    No units found. Click "Add Unit" to get started.
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
              disabled={isFormSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUnit} disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
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
            <AlertDialogCancel disabled={isDeleteSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleteSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleteSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
              ) : (
                  'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
