
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
import type { User, Unit } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getUnits, getUsers } from '@/lib/firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersData, unitsData] = await Promise.all([getUsers(), getUnits()]);
        unitsData.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(usersData);
        setUnits(unitsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch data.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedUser({ id: '', name: '', role: 'mess_staff' });
    setIsEditDialogOpen(true);
  }
  
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    if (!selectedUser.id || !selectedUser.name) {
        toast({ variant: "destructive", title: "Error", description: "Service ID and Name are required." });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const isEditing = users.some(u => u.id === selectedUser.id);
        
        // This is the data that will be saved to Firestore.
        // We create a copy and remove the `id` field from it
        // because we don't want to save the document ID inside the document itself.
        const { id: userId, ...userDataToSave } = selectedUser;

        const userDocRef = doc(firestore, 'users', userId);

        if (isEditing) {
            // Update existing user
            await updateDoc(userDocRef, userDataToSave);
            setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
            toast({ title: "Success", description: "User updated successfully." });
        } else {
            // Add new user using setDoc to specify the ID
            await setDoc(userDocRef, userDataToSave);
            setUsers([...users, selectedUser]);
            toast({ title: "Success", description: "User added successfully." });
        }

        setIsEditDialogOpen(false);
        setSelectedUser(null);
    } catch (error: any) {
        console.error("Error saving user:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save user." });
    } finally {
        setIsSubmitting(false);
    }
  };


  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(firestore, 'users', selectedUser.id));
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        toast({ title: "Success", description: "User deleted successfully." });
    } catch (error: any) {
        console.error("Error deleting user: ", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete user." });
    } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
    }
  };

  const handleFieldChange = (field: keyof Omit<User, 'id'>, value: any) => {
    if (selectedUser) {
      const updatedUser: User = {...selectedUser, [field]: value };
      // If role is changed to admin, remove kitchenId
      if (field === 'role' && value === 'admin') {
        delete updatedUser.kitchenId;
      }
      setSelectedUser(updatedUser);
    }
  };
  
  const getUnitName = (kitchenId?: string) => {
    if (!kitchenId) return 'N/A';
    if (isLoading) return 'Loading...';
    const unit = units.find(u => u.id === kitchenId);
    return unit ? `${unit.name} - ${unit.mess}` : 'Unknown Unit';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Add, edit, or remove users who can access the system.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
              <PlusCircle className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Unit</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
                  </TableRow>
                ) : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell>{user.role === 'mess_staff' ? getUnitName(user.kitchenId) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(user)}
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(user)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser && users.some(u => u.id === selectedUser.id) ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>
              {selectedUser && users.some(u => u.id === selectedUser.id) ? 'Make changes to the user details.' : 'Add a new user to the system.'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={selectedUser.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">Service ID</Label>
                    <Input id="id" value={selectedUser.id} onChange={(e) => setSelectedUser({...selectedUser, id: e.target.value})} className="col-span-3" disabled={users.some(u => u.id === selectedUser.id)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Select value={selectedUser.role} onValueChange={(value: 'admin' | 'mess_staff') => handleFieldChange('role', value)}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="mess_staff">Mess Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {selectedUser.role === 'mess_staff' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kitchenId" className="text-right">Unit / Mess</Label>
                        <Select value={selectedUser.kitchenId || ''} onValueChange={(value) => handleFieldChange('kitchenId', value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(unit => (
                                    <SelectItem key={unit.id} value={unit.id!}>{getUnitName(unit.id)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
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
              This action cannot be undone. This will permanently delete the user's account and remove their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
