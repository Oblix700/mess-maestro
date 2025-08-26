
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { getDaysInMonth, format } from 'date-fns';
import { Loader2, RotateCcw } from 'lucide-react';
import { getUnits, getStrengthForMonth, saveStrengthForMonth } from '@/lib/firebase/firestore';
import type { Unit, MonthlyStrength, DailyStrength } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i);

const generateInitialStrengthsForMonth = (year: number, month: number): { [day: number]: DailyStrength } => {
  const data: { [day: number]: DailyStrength } = {};
  const daysInMonth = getDaysInMonth(new Date(year, month));
  for (let day = 1; day <= daysInMonth; day++) {
    data[day] = {
      breakfast: 100,
      lunch: 100,
      supper: 100,
      lunchPacks: 0,
      scaleM: 0,
      deployment: 0,
    };
  }
  return data;
};

export default function StrengthPlannerPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth());
  const [monthlyStrength, setMonthlyStrength] = useState<MonthlyStrength | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      const unitsData = await getUnits();
      unitsData.sort((a, b) => a.name.localeCompare(b.name));
      setUnits(unitsData);
      if (unitsData.length > 0) {
        setSelectedUnitId(unitsData[0].id);
      }
    };
    fetchUnits();
  }, []);
  
  const fetchStrengths = useCallback(async () => {
    if (!selectedUnitId) return;
    setIsLoading(true);
    try {
      const data = await getStrengthForMonth(selectedUnitId, year, month);
      if (data) {
        setMonthlyStrength(data);
      } else {
        setMonthlyStrength({
          id: `${selectedUnitId}_${year}_${month}`,
          unitId: selectedUnitId,
          year,
          month,
          strengths: generateInitialStrengthsForMonth(year, month),
        });
      }
    } catch (error) {
        console.error("Failed to fetch strength data", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch strength data.'})
    } finally {
      setIsLoading(false);
    }
  }, [selectedUnitId, year, month, toast]);

  useEffect(() => {
    fetchStrengths();
  }, [fetchStrengths]);

  const daysInSelectedMonth = useMemo(() => {
    const date = new Date(year, month);
    return Array.from({ length: getDaysInMonth(date) }, (_, i) => i + 1);
  }, [year, month]);

  const handleStrengthChange = (day: number, mealType: keyof DailyStrength, value: string) => {
    if (!monthlyStrength) return;

    const numericValue = value === '' ? 0 : Number(value);
    if (isNaN(numericValue)) return;
    
    const newStrengths = { ...monthlyStrength.strengths };
    if (!newStrengths[day]) {
      newStrengths[day] = generateInitialStrengthsForMonth(year, month)[day];
    }
    newStrengths[day] = { ...newStrengths[day], [mealType]: numericValue };

    setMonthlyStrength({ ...monthlyStrength, strengths: newStrengths });
  };
  
  const getStrengthValue = (day: number, mealType: keyof DailyStrength) => {
    return monthlyStrength?.strengths[day]?.[mealType] ?? '';
  }

  const handleClearAll = () => {
    if (!monthlyStrength) return;
    setMonthlyStrength({ ...monthlyStrength, strengths: generateInitialStrengthsForMonth(year, month) });
  };
  
  const handleSaveChanges = async () => {
    if (!monthlyStrength) return;
    setIsSaving(true);
    try {
        await saveStrengthForMonth(monthlyStrength);
        toast({ title: 'Success', description: 'Strength plan saved successfully.' });
    } catch(error) {
        console.error("Failed to save strength data", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save strength plan.'})
    } finally {
        setIsSaving(false);
    }
  };

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
                 <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={units.length === 0}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map(u => <SelectItem key={u.id} value={u.id}>{`${u.name} - ${u.mess}`}</SelectItem>)}
                    </SelectContent>
                </Select>
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
                <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-1" disabled={isLoading || isSaving}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
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
                        <TableHead>B'fast %</TableHead>
                        <TableHead>Lunch %</TableHead>
                        <TableHead>Supper %</TableHead>
                        <TableHead>LP %</TableHead>
                        <TableHead>Scale M %</TableHead>
                        <TableHead>Deploy %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : daysInSelectedMonth.map(day => {
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
