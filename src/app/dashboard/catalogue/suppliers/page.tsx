
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
import type { Supplier } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const suppliersCollection = collection(firestore, 'suppliers');
        const querySnapshot = await getDocs(suppliersCollection);
        const suppliersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not fetch suppliers from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, [toast]);
  
  // For now, we'll just show all suppliers. 
  // Later this will be filtered by the logged-in user's kitchenId.
  const filteredSuppliers = suppliers;

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    // Assuming a default kitchenId or logic to get the current user's kitchenId
    setSelectedSupplier({ id: '', name: '', contactPerson: '', phone: '', email: '', kitchenId: 'all' });
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveSupplier = async () => {
    if (!selectedSupplier) return;
    
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

    setIsEditDialogOpen(false);
    setSelectedSupplier(null);
  };


  const handleDeleteSupplier = async () => {
    if (!selectedSupplier || !selectedSupplier.id) return;
    try {
        await deleteDoc(doc(firestore, 'suppliers', selectedSupplier.id));
        setSuppliers(suppliers.filter((s) => s.id !== selectedSupplier.id));
        toast({ title: "Success", description: "Supplier deleted successfully." });
    } catch (error) {
        console.error("Error deleting supplier: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete supplier." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleFieldChange = (field: keyof Omit<Supplier, 'id'>, value: string) => {
    if (selectedSupplier) {
      setSelectedSupplier({ ...selectedSupplier, [field]: value });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage your mess's suppliers.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell className="flex justify-end gap-2">
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
            <DialogTitle>{selectedSupplier?.id ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              Make changes to the supplier. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={selectedSupplier?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                value={selectedSupplier?.contactPerson || ''}
                onChange={(e) =>
                  handleFieldChange('contactPerson', e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={selectedSupplier?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={selectedSupplier?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
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
            <Button onClick={handleSaveSupplier}>Save changes</Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
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
