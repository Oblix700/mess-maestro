
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

interface RationScaleRow extends RationScaleItem {
  isModified?: boolean;
}

export default function RationScalePage() {
  const [items, setItems] = useState<RationScaleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rationScaleData, categoriesData, uomData] = await Promise.all([
          getRationScale(),
          getCategories(),
          getUoms(),
        ]);
        const rationScaleRows = rationScaleData.map(doc => ({ 
            ...doc, 
            quantity: Number(doc.quantity || 0), // Ensure quantity is a number
            isModified: false 
        }));
        setItems(rationScaleRows);
        setCategories(categoriesData);
        setUnitsOfMeasure(uomData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch ration scale data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleFieldChange = (itemId: string, field: 'quantity' | 'unitOfMeasureId', value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          let newValue = value;
          if (field === 'quantity') {
            // Ensure the value from input is treated as a number for state updates
            newValue = Number(value);
          }
          return { ...item, [field]: newValue, isModified: true };
        }
        return item;
      })
    );
  };

  const handleSaveChanges = async () => {
    const modifiedItems = items.filter(item => item.isModified);
    if (modifiedItems.length === 0) {
      toast({ title: "No changes to save." });
      return;
    }

    setIsSaving(true);
    const batch = writeBatch(firestore);

    modifiedItems.forEach(item => {
      const { isModified, ...itemData } = item;
      const itemRef = doc(firestore, 'rationScaleItems', item.id);
      batch.update(itemRef, {
        quantity: Number(itemData.quantity), // Ensure quantity is saved as a number
        unitOfMeasureId: itemData.unitOfMeasureId,
      });
    });

    try {
      await batch.commit();
      toast({ title: "Success", description: "Ration scale updated successfully." });
      setItems(prev => prev.map(item => ({ ...item, isModified: false })));
    } catch (error) {
      console.error("Error saving ration scale:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => items.some(item => item.isModified), [items]);

  const itemsByCategory = useMemo(() => {
    const grouped: { [key: string]: RationScaleRow[] } = {};
    items.forEach(item => {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = [];
      }
      grouped[item.categoryId].push(item);
    });
    // Sort items within each category
    for (const categoryId in grouped) {
        grouped[categoryId].sort((a,b) => a.name.localeCompare(b.name));
    }
    return grouped;
  }, [items]);

  const sortedCategoryIds = useMemo(() => {
    return categories.map(c => c.id).filter(id => itemsByCategory[id]).sort((a, b) => {
        const catA = categories.find(c => c.id === a)?.name || '';
        const catB = categories.find(c => c.id === b)?.name || '';
        return catA.localeCompare(catB);
    });
  }, [categories, itemsByCategory]);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ration Scale</CardTitle>
            <CardDescription>
              Manage the standard ration scale for each ingredient. Add/edit ingredients in the Catalogue.
            </CardDescription>
          </div>
          <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[180px]">UOM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading ration scale...</TableCell>
                </TableRow>
              ) : sortedCategoryIds.length > 0 ? (
                sortedCategoryIds.map(categoryId => (
                  <React.Fragment key={categoryId}>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={3} className="font-bold text-primary sticky left-0 bg-muted/50 z-10">
                            {getCategoryName(categoryId)}
                        </TableCell>
                    </TableRow>
                    {itemsByCategory[categoryId].map(item => (
                      <TableRow key={item.id} className={cn(item.isModified && "bg-blue-50 dark:bg-blue-900/20")}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={Number.isNaN(item.quantity) ? '' : Number(item.quantity).toFixed(3)}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only numbers and a single decimal point
                              if (/^\d*\.?\d{0,3}$/.test(value) || value === '') {
                                handleFieldChange(item.id, 'quantity', value);
                              }
                            }}
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
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
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
