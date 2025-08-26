
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
import type { Region } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface RegionClientTableProps {
    initialRegions: Region[];
}

export function RegionClientTable({ initialRegions }: RegionClientTableProps) {
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { toast } = useToast();

  const handleEditClick = (region: Region) => {
    setSelectedRegion(region);
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedRegion({ id: '', name: '' });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRegion = async () => {
    if (!selectedRegion || !selectedRegion.name) {
        toast({ variant: "destructive", title: "Validation Error", description: "Region name is required." });
        return;
    }
    setIsLoading(true);

    if (selectedRegion.id) {
        // Update existing region
        try {
            const regionDocRef = doc(firestore, 'regions', selectedRegion.id);
            const { id, ...regionData } = selectedRegion;
            await updateDoc(regionDocRef, regionData);
            setRegions(regions.map((r) => (r.id === selectedRegion.id ? selectedRegion : r)));
            toast({ title: "Success", description: "Region updated successfully." });
        } catch (error) {
            console.error("Error updating region: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update region." });
        }
    } else {
        // Add new region
        try {
            const { id, ...newRegionData } = selectedRegion;
            const docRef = await addDoc(collection(firestore, 'regions'), newRegionData);
            setRegions([...regions, { id: docRef.id, ...newRegionData }]);
            toast({ title: "Success", description: "Region added successfully." });
        } catch (error) {
            console.error("Error adding region: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add region." });
        }
    }

    setIsLoading(false);
    setIsEditDialogOpen(false);
    setSelectedRegion(null);
  };

  const handleDeleteRegion = async () => {
    if (!selectedRegion || !selectedRegion.id) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(firestore, 'regions', selectedRegion.id));
        setRegions(regions.filter((r) => r.id !== selectedRegion.id));
        toast({ title: "Success", description: "Region deleted successfully." });
    } catch (error) {
        console.error("Error deleting region: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete region. It might be in use by a supplier or unit." });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedRegion(null);
  };

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add Region
            </Button>
        </div>
      <div className="relative overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region Name</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No regions found.</TableCell>
                </TableRow>
            ) : regions.map((region) => (
              <TableRow key={region.id}>
                <TableCell className="font-medium">{region.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(region)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(region)}
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
            <DialogTitle>{selectedRegion?.id ? 'Edit Region' : 'Add Region'}</DialogTitle>
            <DialogDescription>
              {selectedRegion?.id ? "Make changes to the region name." : 'Add a new region to the list.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Region Name
              </Label>
              <Input
                id="name"
                value={selectedRegion?.name || ''}
                onChange={(e) => setSelectedRegion(selectedRegion ? { ...selectedRegion, name: e.target.value } : null)}
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
            <Button onClick={handleSaveRegion} disabled={isLoading}>
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
              region.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegion}
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
