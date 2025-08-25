
'use client';

import React, { useState, useEffect } from 'react';
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
import { menuCycle } from '@/lib/menu-data';
import type { MenuDefinition, MenuPlanItem } from '@/lib/types';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MenuPlanningPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentMenu, setCurrentMenu] = useState<MenuDefinition | null>(null);

  useEffect(() => {
    const menuData = menuCycle.find((menu) => menu.day === selectedDay);
    // Deep copy to prevent modifying the original placeholder data
    setCurrentMenu(menuData ? JSON.parse(JSON.stringify(menuData)) : null);
  }, [selectedDay]);

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
                <Select value={String(selectedDay)} onValueChange={handleDayChange}>
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
                <Button>Save Changes</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentMenu ? (
         <MenuDay menu={currentMenu} onItemChange={handleItemChange} />
      ) : (
        <Card>
            <CardContent className="pt-6">
                <p>Please select a day to see the menu plan.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
