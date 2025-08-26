
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuDay } from '@/components/menu-day';
import type { MenuDefinition, MenuPlanItem, Category, RationScaleItem, UnitOfMeasure, Dish } from '@/lib/types';
import { getCategories, getDishes, getMenuCycle, getRationScale, getUoms } from '@/lib/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MenuPlanningPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentMenu, setCurrentMenu] = useState<MenuDefinition | null>(null);
  const [initialMenuJson, setInitialMenuJson] = useState<string>('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [rationScaleItems, setRationScaleItems] = useState<RationScaleItem[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchMenuData = useCallback(async (day: number) => {
    setIsLoading(true);
    try {
      // Fetch all required data in parallel
      const [
        menuData,
        categoriesData,
        rationScaleData,
        uomData,
        dishesData
      ] = await Promise.all([
        getMenuCycle(day),
        getCategories(),
        getRationScale(),
        getUoms(),
        getDishes()
      ]);
      
      setCategories(categoriesData);
      setRationScaleItems(rationScaleData);
      setUnitsOfMeasure(uomData);
      setDishes(dishesData);

      if (menuData) {
        const menuJson = JSON.stringify(menuData);
        setCurrentMenu(JSON.parse(menuJson));
        setInitialMenuJson(menuJson);
      } else {
        setCurrentMenu(null);
        setInitialMenuJson('');
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not find menu for day ${day}.`,
        });
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch menu data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchMenuData(selectedDay);
  }, [selectedDay, fetchMenuData]);
  

  const handleDayChange = (value: string) => {
    setSelectedDay(parseInt(value, 10));
  };
  
  const handleItemChange = (sectionId: string, itemId: string, updatedValues: Partial<MenuPlanItem>) => {
    if (!currentMenu) return;

    const newMenu = { ...currentMenu };
    const section = newMenu.sections.find(s => s.id === sectionId);
    if (section) {
      const itemIndex = section.items.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        section.items[itemIndex] = { ...section.items[itemIndex], ...updatedValues };
        setCurrentMenu(newMenu);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!currentMenu) return;
    setIsSaving(true);
    try {
      const menuDocRef = doc(firestore, 'menuCycle', String(currentMenu.day));
      // Firestore doesn't like undefined values, so we stringify and parse to clean it up.
      const cleanedMenu = JSON.parse(JSON.stringify(currentMenu));
      await updateDoc(menuDocRef, cleanedMenu);
      setInitialMenuJson(JSON.stringify(currentMenu));
      toast({
        title: "Success",
        description: `Menu for Day ${currentMenu.day} saved successfully.`,
      });
    } catch (error) {
      console.error("Error saving menu:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = currentMenu ? JSON.stringify(currentMenu) !== initialMenuJson : false;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>28-Day Menu Cycle</CardTitle>
              <CardDescription>
                Select a day to view or edit its menu plan.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={String(selectedDay)} onValueChange={handleDayChange} disabled={isLoading || isSaving}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                                Day {i + 1} ({daysOfWeek[i % 7]})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : currentMenu ? (
         <MenuDay 
            menu={currentMenu} 
            onItemChange={handleItemChange} 
            categories={categories}
            rationScaleItems={rationScaleItems}
            unitsOfMeasure={unitsOfMeasure}
            dishes={dishes}
        />
      ) : (
        <Card>
            <CardContent className="pt-6">
                <p>Could not load menu plan for the selected day.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
