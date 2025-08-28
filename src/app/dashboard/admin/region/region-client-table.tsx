
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
import type { Region } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, updateDoc, deleteDoc, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function RegionClientTable() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(firestore, 'regions'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const regionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Region));
        setRegions(regionsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching regions in real-time: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load regions."});
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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
    setIsSubmitting(true);

    try {
      if (selectedRegion.id) {
          const regionDocRef = doc(firestore, 'regions', selectedRegion.id);
          const { id, ...regionData } = selectedRegion;
          await updateDoc(regionDocRef, regionData);
          toast({ title: "Success", description: "Region updated successfully." });
      } else {
          const { id, ...newRegionData } = selectedRegion;
          await addDoc(collection(firestore, 'regions'), newRegionData);
          toast({ title: "Success", description: "Region added successfully." });
      }
      setIsEditDialogOpen(false);
      setSelectedRegion(null);
    } catch (error) {
        console.error("Error saving region: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save region." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!selectedRegion || !selectedRegion.id) return;
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(firestore, 'regions', selectedRegion.id));
        toast({ title: "Success", description: "Region deleted successfully." });
        setIsDeleteDialogOpen(false);
        setSelectedRegion(null);
    } catch (error) {
        console.error("Error deleting region: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete region. It might be in use by a supplier or unit." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add Region
            </Button>
        </div>
      <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Region Name</TableHead>
              <TableHead className="w-[100px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                ))
            ) : regions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No regions found.</TableCell>
                </TableRow>
            ) : regions.map((region) => (
              <TableRow key={region.id}>
                <TableCell className="font-medium">{region.name}</TableCell>
                <TableCell className="text-right">
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRegion} disabled={isSubmitting}>
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
              region.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegion}
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
