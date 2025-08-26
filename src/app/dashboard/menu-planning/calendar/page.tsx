
'use client';

import React, { useState } from 'react';
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
import { FullYearCalendar } from '@/components/full-year-calendar';

export default function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const handleYearChange = (value: string) => {
    setYear(parseInt(value, 10));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Menu Planning Calendar</CardTitle>
            <CardDescription>
              Yearly overview of your 28-day menu cycle.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <FullYearCalendar year={year} />
      </CardContent>
    </Card>
  );
}
