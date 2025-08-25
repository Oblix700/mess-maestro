
'use client';

import React, { useState } from 'react';
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

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MenuPlanningPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const selectedMenu = menuCycle.find((menu) => menu.day === selectedDay);

  const handleDayChange = (value: string) => {
    setSelectedDay(parseInt(value, 10));
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

      {selectedMenu ? (
         <MenuDay menu={selectedMenu} />
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
