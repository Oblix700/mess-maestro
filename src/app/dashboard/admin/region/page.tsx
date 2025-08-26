
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
import { Globe, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Region } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RegionPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoading(true);
      try {
        const regionsCollection = collection(firestore, 'regions');
        const querySnapshot = await getDocs(regionsCollection);
        const regionData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Region));
        setRegions(regionData);
      } catch (error) {
        console.error("Error fetching regions: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch regions from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegions();
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

    if (selectedRegion.id) {
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

    setIsEditDialogOpen(false);
    setSelectedRegion(null);
  };

  const handleDeleteRegion = async () => {
    if (!selectedRegion || !selectedRegion.id) return;
    try {
        await deleteDoc(doc(firestore, 'regions', selectedRegion.id));
        setRegions(regions.filter((r) => r.id !== selectedRegion.id));
        toast({ title: "Success", description: "Region deleted successfully." });
    } catch (error) {
        console.error("Error deleting region: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete region. It might be in use by a supplier or unit." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedRegion(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Regions</CardTitle>
              <CardDescription>
                Manage the geographic regions for units and suppliers.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add Region
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">Loading...</TableCell>
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
        </CardContent>
      </Card>

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
            <Button onClick={handleSaveRegion}>Save changes</Button>
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
