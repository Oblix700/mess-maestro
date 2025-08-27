
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuDay } from '@/components/menu-day';
import type { MenuDefinition, MenuPlanItem, Category, RationScaleItem, UnitOfMeasure, Dish } from '@/lib/types';
import { getCategories, getDishes, getMenuCycle, getRationScale, getUoms } from '@/lib/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  

  const handleDayChange = (day: number) => {
    if (day < 1 || day > 28) return;
    setSelectedDay(day);
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

  const handleAddItem = (sectionId: string) => {
    if (!currentMenu) return;

    const newMenu = { ...currentMenu };
    const section = newMenu.sections.find(s => s.id === sectionId);
    if (section) {
      const newItem: MenuPlanItem = {
        id: `new_${Date.now()}_${Math.random()}`, // Simple unique ID
        mealPlanCategoryId: '',
        ingredientId: null,
        dishId: null,
        strength: 100,
      };
      section.items.push(newItem);
      setCurrentMenu(newMenu);
    }
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    if (!currentMenu) return;

    const newMenu = { ...currentMenu };
    const section = newMenu.sections.find(s => s.id === sectionId);
    if (section) {
      section.items = section.items.filter(item => item.id !== itemId);
      setCurrentMenu(newMenu);
    }
  };


  const handleSaveChanges = async () => {
    if (!currentMenu) return;
    setIsSaving(true);
    try {
      const menuDocRef = doc(firestore, 'menuCycle', String(currentMenu.day));
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
  const menuDayProps = { 
    menu: currentMenu, 
    onItemChange: handleItemChange, 
    onAddItem: handleAddItem,
    onRemoveItem: handleRemoveItem,
    categories: categories,
    rationScaleItems: rationScaleItems,
    unitsOfMeasure: unitsOfMeasure,
    dishes: dishes
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>28-Day Cycle Menu</CardTitle>
              <CardDescription>
                Select a day to view or edit its menu plan.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleDayChange(selectedDay - 1)} disabled={selectedDay === 1 || isLoading || isSaving}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center w-32">
                    <span className="font-bold">Day {selectedDay}</span>
                    <p className="text-sm text-muted-foreground">{daysOfWeek[(selectedDay - 1) % 7]}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleDayChange(selectedDay + 1)} disabled={selectedDay === 28 || isLoading || isSaving}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="kitchen_menu">
        <TabsList>
          <TabsTrigger value="kitchen_menu">Kitchen Menu</TabsTrigger>
          <TabsTrigger value="lunch_packs">Lunch Packs</TabsTrigger>
          <TabsTrigger value="sustainment_packs">Sustainment Packs</TabsTrigger>
          <TabsTrigger value="scale_m">Scale M</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>
        <TabsContent value="kitchen_menu">
            {isLoading ? (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            ) : currentMenu ? (
                <MenuDay {...menuDayProps} filter="kitchen" />
            ) : (
                <Card><CardContent className="pt-6"><p>Could not load menu plan for the selected day.</p></CardContent></Card>
            )}
        </TabsContent>
         <TabsContent value="lunch_packs">
             {isLoading ? <Skeleton className="h-40 w-full" /> : currentMenu && <MenuDay {...menuDayProps} filter="lunch_packs" />}
        </TabsContent>
         <TabsContent value="sustainment_packs">
            {isLoading ? <Skeleton className="h-40 w-full" /> : currentMenu && <MenuDay {...menuDayProps} filter="sustainment_packs" />}
        </TabsContent>
         <TabsContent value="scale_m">
            {isLoading ? <Skeleton className="h-40 w-full" /> : currentMenu && <MenuDay {...menuDayProps} filter="scale_m" />}
        </TabsContent>
        <TabsContent value="deployment">
            {isLoading ? <Skeleton className="h-40 w-full" /> : currentMenu && <MenuDay {...menuDayProps} filter="deployment" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
