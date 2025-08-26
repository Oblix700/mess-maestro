
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import type { Unit, Supplier, Region } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';


interface UnitsClientProps {
    initialUnits: Unit[];
    initialSuppliers: Supplier[];
    initialRegions: Region[];
}

export function UnitsClient({ initialUnits, initialSuppliers, initialRegions }: UnitsClientProps) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isRegionPopoverOpen, setIsRegionPopoverOpen] = useState(false);
  const { toast } = useToast();

  const handleEditClick = (unit: Unit) => {
    const unitWithAccounts = {
        ...unit,
        supplierAccounts: Array.isArray(unit.supplierAccounts) ? unit.supplierAccounts : [],
        regions: Array.isArray(unit.regions) ? unit.regions : [],
    };
    setSelectedUnit(unitWithAccounts);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedUnit({ id: '', name: '', mess: '', supplierAccounts: [], regions: [] });
    setIsEditDialogOpen(true);
  }

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;

    if (!selectedUnit.id || !selectedUnit.name || !selectedUnit.mess) {
        toast({ variant: "destructive", title: "Validation Error", description: "Unit ID, Name and Mess are required." });
        return;
    }

    setIsSubmitting(true);
    const isEditing = units.some(u => u.id === selectedUnit.id);
    const { id: unitId, ...unitData } = selectedUnit;
    const unitDocRef = doc(firestore, 'units', unitId);

    try {
        if (isEditing) {
            await updateDoc(unitDocRef, unitData);
            const updatedUnits = units.map((u) => (u.id === selectedUnit.id ? selectedUnit : u));
            setUnits(updatedUnits);
            toast({ title: "Success", description: "Unit updated successfully." });
        } else {
            await setDoc(unitDocRef, unitData);
            const updatedUnits = [...units, selectedUnit];
            updatedUnits.sort((a, b) => {
                const aNum = parseInt(a.id.replace(/\D/g,''), 10);
                const bNum = parseInt(b.id.replace(/\D/g,''), 10);
                 if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return a.name.localeCompare(b.name);
            });
            setUnits(updatedUnits);
            toast({ title: "Success", description: "Unit added successfully." });
        }
    } catch (error) {
        console.error("Error saving unit: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save unit." });
    } finally {
        setIsSubmitting(false);
        setIsEditDialogOpen(false);
        setSelectedUnit(null);
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit || !selectedUnit.id) return;
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(firestore, 'units', selectedUnit.id));
        setUnits(units.filter((u) => u.id !== selectedUnit.id));
        toast({ title: "Success", description: "Unit deleted successfully." });
    } catch (error) {
        console.error("Error deleting unit: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete unit." });
    } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setSelectedUnit(null);
    }
  };

  const handleFieldChange = (field: keyof Omit<Unit, 'id' | 'supplierAccounts' | 'regions'>, value: any) => {
    if (selectedUnit) {
      setSelectedUnit({ ...selectedUnit, [field]: value });
    }
  };
  
  const handleIdChange = (value: string) => {
     if (selectedUnit) {
      setSelectedUnit({ ...selectedUnit, id: value });
    }
  }

  const handleAccountChange = (index: number, field: 'supplierId' | 'accountNumber', value: string) => {
    if (selectedUnit) {
      const updatedAccounts = [...(selectedUnit.supplierAccounts || [])];
      updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
      setSelectedUnit({ ...selectedUnit, supplierAccounts: updatedAccounts });
    }
  };
  
  const handleRegionToggle = (regionName: string) => {
      if (selectedUnit) {
        const currentRegions = selectedUnit.regions || [];
        const newRegions = currentRegions.includes(regionName)
            ? currentRegions.filter(r => r !== regionName)
            : [...currentRegions, regionName];
        setSelectedUnit({ ...selectedUnit, regions: newRegions });
      }
  }

  const addAccount = () => {
    if (selectedUnit) {
        const newAccount = { supplierId: '', accountNumber: '' };
        const updatedAccounts = [...(selectedUnit.supplierAccounts || []), newAccount];
        setSelectedUnit({ ...selectedUnit, supplierAccounts: updatedAccounts });
    }
  };

  const removeAccount = (index: number) => {
    if (selectedUnit) {
        const updatedAccounts = [...(selectedUnit.supplierAccounts || [])];
        updatedAccounts.splice(index, 1);
        setSelectedUnit({ ...selectedUnit, supplierAccounts: updatedAccounts });
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = initialSuppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.name} (${supplier.regions?.join(', ') || ''})` : 'Unknown Supplier';
  };

  const isEditing = selectedUnit && units.some(u => u.id === selectedUnit.id);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1" onClick={handleAddClick}>
          <PlusCircle className="h-4 w-4" />
          Add Unit
        </Button>
      </div>
      <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Mess</TableHead>
              <TableHead>Regions</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-mono text-xs">{unit.id}</TableCell>
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
                    <Button size="icon" variant="ghost" onClick={() => handleEditClick(unit)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(unit)} className="text-destructive hover:text-destructive">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Make changes to the unit. Click save when you're done." : 'Add a new unit to the database.'}
            </DialogDescription>
          </DialogHeader>
         {selectedUnit && <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">Unit ID</Label>
              <Input id="id" value={selectedUnit.id || ''} onChange={(e) => handleIdChange(e.target.value)} className="col-span-3" placeholder="e.g. 22" disabled={isEditing} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Unit Name</Label>
              <Input id="name" value={selectedUnit.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" placeholder="e.g. AFB WKLF" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mess" className="text-right">Mess</Label>
              <Input id="mess" value={selectedUnit.mess || ''} onChange={(e) => handleFieldChange('mess', e.target.value)} className="col-span-3" placeholder="e.g. NCO Mess" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Regions</Label>
                <Popover open={isRegionPopoverOpen} onOpenChange={setIsRegionPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={isRegionPopoverOpen} className="col-span-3 justify-between h-auto">
                      <div className="flex flex-wrap gap-1">
                        {selectedUnit.regions && selectedUnit.regions.length > 0 ? (
                            selectedUnit.regions.map(region => <Badge key={region} variant="secondary">{region}</Badge>)
                        ) : "Select regions..."}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search regions..." />
                      <CommandList>
                        <CommandEmpty>No regions found.</CommandEmpty>
                        <CommandGroup>
                           {initialRegions.map(region => (
                            <CommandItem
                                key={region.id}
                                value={region.name}
                                onSelect={() => handleRegionToggle(region.name)}
                            >
                                <Check className={cn("mr-2 h-4 w-4", selectedUnit.regions?.includes(region.name) ? "opacity-100" : "opacity-0")} />
                                {region.name}
                            </CommandItem>
                           ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            <div className="col-span-4">
              <Label className="font-semibold">Supplier Accounts</Label>
              <div className="mt-2 space-y-2 rounded-lg border p-4">
                {(selectedUnit.supplierAccounts || []).map((account, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <Select value={account.supplierId} onValueChange={(value) => handleAccountChange(index, 'supplierId', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialSuppliers.map(s => (
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
                {(!selectedUnit.supplierAccounts || selectedUnit.supplierAccounts.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center">No supplier accounts added.</p>
                )}
                <Button variant="outline" size="sm" onClick={addAccount} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </div>
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveUnit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the unit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUnit}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
