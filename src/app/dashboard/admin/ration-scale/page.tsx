
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { RationScaleItem, Category, UnitOfMeasure } from '@/lib/types';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { getCategories, getUoms, getRationScale } from '@/lib/firebase/firestore';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// The row now holds the full RationScaleItem object, which contains all necessary data.
interface RationScaleRow extends RationScaleItem {
  isModified?: boolean;
}

export default function RationScalePage() {
  // This page now fetches and manages the full RationScaleItem objects.
  const [items, setItems] = useState<RationScaleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data from Firestore.
        const [rationScaleData, categoriesData, uomData] = await Promise.all([
          getRationScale(),
          getCategories(),
          getUoms(),
        ]);

        // Map the fetched data to the component's state structure.
        const rationScaleRows = rationScaleData.map(doc => ({ ...doc, isModified: false } as RationScaleRow));
        
        rationScaleRows.sort((a,b) => a.name.localeCompare(b.name));

        setItems(rationScaleRows);
        setCategories(categoriesData);
        setUnitsOfMeasure(uomData);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch ration scale data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);


  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  }

  const handleFieldChange = (itemId: string, field: 'quantity' | 'unitOfMeasureId', value: string | number) => {
     setItems(prevItems => 
      prevItems.map(item =>
        item.id === itemId
        ? { ...item, [field]: value, isModified: true }
        : item
      )
     )
  }

  const handleSaveChanges = async () => {
    const modifiedItems = items.filter(item => item.isModified);
    if(modifiedItems.length === 0){
      toast({ title: "No changes to save." });
      return;
    }
    
    setIsSaving(true);
    const batch = writeBatch(firestore);

    modifiedItems.forEach(item => {
        const { isModified, ...itemData } = item;
        const itemRef = doc(firestore, 'rationScaleItems', item.id);
        // We now save the complete itemData object, as it matches the Firestore document structure.
        batch.update(itemRef, itemData);
    });

    try {
        await batch.commit();
        toast({ title: "Success", description: "Ration scale updated successfully." });
        setItems(prev => prev.map(item => ({...item, isModified: false})));
    } catch (error) {
        console.error("Error saving ration scale:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
        setIsSaving(false);
    }
  }
  
  const hasChanges = useMemo(() => items.some(item => item.isModified), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const nameMatches = item.name.toLowerCase().includes(nameFilter.toLowerCase());
      const categoryMatches = categoryFilter === '' || categoryFilter.toLowerCase() === 'all' || item.categoryId === categoryFilter;
      return nameMatches && categoryMatches;
    });
  }, [items, nameFilter, categoryFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ration Scale</CardTitle>
            <CardDescription>
              Manage the standard ration scale for each ingredient.
            </CardDescription>
          </div>
           <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-4">
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select onValueChange={setCategoryFilter} defaultValue="all">
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-18rem)] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[180px]">UOM</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Loading ration scale...</TableCell>
                    </TableRow>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                      <TableRow key={item.id} className={cn(item.isModified && "bg-blue-50 dark:bg-blue-900/20")}>
                          {/* We can now directly access the name from the item */}
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {/* The category name is looked up from the fetched categories list */}
                            {getCategoryName(item.categoryId)}
                          </TableCell>
                          <TableCell>
                              <Input 
                                  type="text" 
                                  inputMode="decimal"
                                  value={item.quantity} 
                                  onChange={(e) => handleFieldChange(item.id, 'quantity', e.target.value.replace(/,/, '.'))}
                                  className="w-full" 
                              />
                          </TableCell>
                          <TableCell>
                          <Select value={item.unitOfMeasureId} onValueChange={(value) => handleFieldChange(item.id, 'unitOfMeasureId', value)}>
                              <SelectTrigger>
                              <SelectValue placeholder="Select UOM" />
                              </SelectTrigger>
                              <SelectContent>
                              {unitsOfMeasure.map((uom) => (
                                  <SelectItem key={uom.id} value={uom.id}>
                                  {uom.name}
                                  </SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          </TableCell>
                      </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No ration scale items found. Ensure the database is seeded on the Check Status page.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
