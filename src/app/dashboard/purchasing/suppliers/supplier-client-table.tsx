
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
import { Badge } from '@/components/ui/badge';
import { Pencil, PlusCircle, Trash2, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Supplier } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SupplierClientTableProps {
    initialSuppliers: Supplier[];
}

export function SupplierClientTable({ initialSuppliers }: SupplierClientTableProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [currentRegion, setCurrentRegion] = useState('');
  const { toast } = useToast();
  
  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier({ ...supplier, regions: supplier.regions || [] });
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedSupplier({ id: '', name: '', contactPerson: '', phone: '', email: '', regions: [] });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveSupplier = async () => {
    if (!selectedSupplier || !selectedSupplier.name) {
        toast({ variant: "destructive", title: "Validation Error", description: "Supplier name cannot be empty."});
        return;
    }
    setIsLoading(true);
    
    if (selectedSupplier.id) {
        try {
            const supplierDocRef = doc(firestore, 'suppliers', selectedSupplier.id);
            const { id, ...supplierData } = selectedSupplier;
            await updateDoc(supplierDocRef, supplierData);
            setSuppliers(suppliers.map((s) => (s.id === selectedSupplier.id ? selectedSupplier : s)));
            toast({ title: "Success", description: "Supplier updated successfully." });
        } catch (error) {
            console.error("Error updating supplier: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update supplier." });
        }
    } else {
        try {
            const { id, ...newSupplierData } = selectedSupplier;
            const docRef = await addDoc(collection(firestore, 'suppliers'), newSupplierData);
            setSuppliers([...suppliers, { id: docRef.id, ...newSupplierData }]);
            toast({ title: "Success", description: "Supplier added successfully." });
        } catch (error) {
            console.error("Error adding supplier: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add supplier." });
        }
    }

    setIsLoading(false);
    setIsEditDialogOpen(false);
    setSelectedSupplier(null);
  };


  const handleDeleteSupplier = async () => {
    if (!selectedSupplier || !selectedSupplier.id) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(firestore, 'suppliers', selectedSupplier.id));
        setSuppliers(suppliers.filter((s) => (s.id !== selectedSupplier.id)));
        toast({ title: "Success", description: "Supplier deleted successfully." });
    } catch (error) {
        console.error("Error deleting supplier: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete supplier." });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleFieldChange = (field: keyof Omit<Supplier, 'id' | 'regions'>, value: string) => {
    if (selectedSupplier) {
      setSelectedSupplier({ ...selectedSupplier, [field]: value });
    }
  };

  const addRegion = () => {
    if (selectedSupplier && currentRegion && !selectedSupplier.regions.includes(currentRegion)) {
        const updatedRegions = [...(selectedSupplier.regions || []), currentRegion];
        setSelectedSupplier({...selectedSupplier, regions: updatedRegions});
        setCurrentRegion('');
    }
  };

  const removeRegion = (regionToRemove: string) => {
    if (selectedSupplier) {
        const updatedRegions = selectedSupplier.regions.filter(r => r !== regionToRemove);
        setSelectedSupplier({...selectedSupplier, regions: updatedRegions});
    }
  }


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1" onClick={handleAddClick}>
          <PlusCircle className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>
      <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Regions</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No suppliers found.</TableCell>
                </TableRow>
            ) : suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                      {supplier.regions && supplier.regions.length > 0 ? (
                          supplier.regions.map(region => <Badge key={region} variant="secondary">{region}</Badge>)
                      ) : (
                          <span className="text-sm text-muted-foreground">No regions</span>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(supplier)}
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

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.id ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              Make changes to the supplier. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={selectedSupplier?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" value={selectedSupplier?.contactPerson || ''} onChange={(e) => handleFieldChange('contactPerson', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={selectedSupplier?.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={selectedSupplier?.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} />
                </div>
            </div>
            
            <div className="grid gap-2">
                <Label>Regions</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Enter region name" 
                        value={currentRegion} 
                        onChange={e => setCurrentRegion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRegion())}
                    />
                    <Button type="button" onClick={addRegion}>Add Region</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px]">
                    {selectedSupplier?.regions && selectedSupplier.regions.length > 0 ? (
                        selectedSupplier.regions.map(region => (
                             <Badge key={region} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                                <span>{region}</span>
                                <button 
                                onClick={() => removeRegion(region)}
                                className="ml-1 rounded-full opacity-50 hover:opacity-100 hover:bg-destructive/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
                                >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove region</span>
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <span className="text-sm text-muted-foreground p-2">No regions added.</span>
                    )}
                </div>
            </div>

          </div>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save changes'}</Button>
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
              supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
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
