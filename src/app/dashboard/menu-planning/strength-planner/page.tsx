
'use client';

import React, { useState, useMemo } from 'react';
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
import { getDaysInMonth, format, startOfMonth } from 'date-fns';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i);

interface StrengthData {
  [key: string]: {
    breakfast: number;
    lunch: number;
    supper: number;
    lunchPacks: number;
    scaleM: number;
    deployment: number;
  };
}

const initialStrengthData = () => {
    const data: StrengthData = {};
    const date = new Date();
    const daysInCurrentMonth = getDaysInMonth(date);
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const key = format(new Date(date.getFullYear(), date.getMonth(), day), 'yyyy-MM-dd');
        data[key] = {
            breakfast: 100,
            lunch: 100,
            supper: 100,
            lunchPacks: 0,
            scaleM: 0,
            deployment: 0,
        };
    }
    return data;
}

export default function StrengthPlannerPage() {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth());
  const [strengths, setStrengths] = useState<StrengthData>(initialStrengthData());

  const daysInSelectedMonth = useMemo(() => {
    const date = new Date(year, month);
    return Array.from({ length: getDaysInMonth(date) }, (_, i) => i + 1);
  }, [year, month]);

  const handleStrengthChange = (day: number, mealType: keyof StrengthData[''], value: string) => {
    const key = format(new Date(year, month, day), 'yyyy-MM-dd');
    const numericValue = Number(value);
    setStrengths(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [mealType]: isNaN(numericValue) ? 0 : numericValue,
      },
    }));
  };
  
  const getStrengthValue = (day: number, mealType: keyof StrengthData['']) => {
    const key = format(new Date(year, month, day), 'yyyy-MM-dd');
    return strengths[key]?.[mealType] ?? 0;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Strength Planner</CardTitle>
                <CardDescription>
                Plan the expected headcount percentage for different meals.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => (
                            <SelectItem key={m} value={String(m)}>{format(new Date(year, m), 'MMMM')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button>Save Changes</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="relative h-[calc(100vh-16rem)] overflow-auto border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead className="w-[80px]">Date</TableHead>
                        <TableHead className="w-[80px]">Day</TableHead>
                        <TableHead className="w-[120px]">B'fast %</TableHead>
                        <TableHead className="w-[120px]">Lunch %</TableHead>
                        <TableHead className="w-[120px]">Supper %</TableHead>
                        <TableHead className="w-[120px]">LP %</TableHead>
                        <TableHead className="w-[120px]">Scale M %</TableHead>
                        <TableHead className="w-[120px]">Deploy %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {daysInSelectedMonth.map(day => {
                        const date = new Date(year, month, day);
                        return (
                            <TableRow key={day}>
                                <TableCell className="font-medium">{day}</TableCell>
                                <TableCell>{format(date, 'EEE')}</TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'breakfast')} onChange={e => handleStrengthChange(day, 'breakfast', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'lunch')} onChange={e => handleStrengthChange(day, 'lunch', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'supper')} onChange={e => handleStrengthChange(day, 'supper', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'lunchPacks')} onChange={e => handleStrengthChange(day, 'lunchPacks', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'scaleM')} onChange={e => handleStrengthChange(day, 'scaleM', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={getStrengthValue(day, 'deployment')} onChange={e => handleStrengthChange(day, 'deployment', e.target.value)} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
         </div>
      </CardContent>
    </Card>
  );
}
