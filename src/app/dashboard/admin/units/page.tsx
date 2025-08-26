
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Unit, Supplier } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
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

  // Fetch suppliers only when the dialog is opened
  useEffect(() => {
    if (isEditDialogOpen) {
        const fetchSuppliers = async () => {
            if (suppliers.length > 0) return; // Don't refetch if already loaded
            try {
                const suppliersCollection = collection(firestore, 'suppliers');
                const querySnapshot = await getDocs(suppliersCollection);
                const suppliersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
                setSuppliers(suppliersData);
            } catch (error) {
                console.error("Error fetching suppliers: ", error);
                toast({
                    variant: "destructive",
                    title: "Error fetching suppliers",
                    description: "Could not fetch the supplier list for the dialog.",
                });
            }
        };
        fetchSuppliers();
    }
  }, [isEditDialogOpen, suppliers.length, toast]);


  const handleEditClick = (unit: Unit) => {
    // Ensure supplierAccounts is an array
    const unitWithAccounts = {
        ...unit,
        supplierAccounts: Array.isArray(unit.supplierAccounts) ? unit.supplierAccounts : [],
    };
    setSelectedUnit(unitWithAccounts);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedUnit({ id: '', name: '', mess: '', supplierAccounts: [] });
    setIsEditDialogOpen(true);
  }

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;

    if (selectedUnit.id) {
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

  const handleFieldChange = (field: keyof Omit<Unit, 'id'>, value: any) => {
    if (selectedUnit) {
      setSelectedUnit({ ...selectedUnit, [field]: value });
    }
  };

  const handleAccountChange = (index: number, field: 'supplierId' | 'accountNumber', value: string) => {
    if (selectedUnit) {
      const updatedAccounts = [...(selectedUnit.supplierAccounts || [])];
      updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
      handleFieldChange('supplierAccounts', updatedAccounts);
    }
  };

  const addAccount = () => {
    if (selectedUnit) {
        const newAccount = { supplierId: '', accountNumber: '' };
        const updatedAccounts = [...(selectedUnit.supplierAccounts || []), newAccount];
        handleFieldChange('supplierAccounts', updatedAccounts);
    }
  };

  const removeAccount = (index: number) => {
    if (selectedUnit) {
        const updatedAccounts = [...(selectedUnit.supplierAccounts || [])];
        updatedAccounts.splice(index, 1);
        handleFieldChange('supplierAccounts', updatedAccounts);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.name} (${supplier.regions.join(', ')})` : 'Unknown Supplier';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Units</CardTitle>
              <CardDescription>
                Manage your kitchens, messes, and their supplier account details.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Mess</TableHead>
                  <TableHead>Regions</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.mess}</TableCell>
                    <TableCell>
                      {unit.regions && unit.regions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {unit.regions.map((region, index) => (
                            <Badge key={index} variant="outline">{region}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No regions</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUnit?.id ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
            <DialogDescription>
              {selectedUnit?.id ? 'Make changes to the unit. Click save when you\\'re done.' : 'Add a new unit to the database.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Unit Name
              </Label>
              <Input
                id="name"
                value={selectedUnit?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
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
            <div className="col-span-4">
              <Label className="font-semibold">Supplier Accounts</Label>
              <div className="mt-2 space-y-2 rounded-lg border p-4">
                {(selectedUnit?.supplierAccounts || []).map((account, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <Select value={account.supplierId} onValueChange={(value) => handleAccountChange(index, 'supplierId', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                            {suppliers.map(s => (
                                <SelectItem key={s.id} value={s.id}>{getSupplierName(s.id)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Account Number"
                      value={account.accountNumber}
                      onChange={(e) => handleAccountChange(index, 'accountNumber', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeAccount(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!selectedUnit?.supplierAccounts || selectedUnit.supplierAccounts.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center">No supplier accounts added.</p>
                )}
                <Button variant="outline" size="sm" onClick={addAccount} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
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
