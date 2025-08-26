
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  generateProcurementList,
  GenerateProcurementListInput,
  GenerateProcurementListOutput,
} from '@/ai/flows/generate-procurement-list';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Check, ChevronsUpDown } from 'lucide-react';
import type { Unit } from '@/lib/types';
import { getUnits } from '@/lib/firebase/firestore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const formSchema = z.object({
  unitIds: z.array(z.string()).min(1, 'At least one unit must be selected.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function OrderGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [procurementList, setProcurementList] =
    useState<GenerateProcurementListOutput | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 6))
        .toISOString()
        .split('T')[0],
    },
  });

  const selectedUnits = form.watch('unitIds');

  useEffect(() => {
    const fetchUnitsData = async () => {
      const unitsData = await getUnits();
      unitsData.sort((a, b) => a.name.localeCompare(b.name));
      setUnits(unitsData);
    };
    fetchUnitsData();
  }, []);

  const getUnitName = (unitId: string) => {
    return units.find((u) => u.id === unitId)?.name || 'Unknown Unit';
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setProcurementList(null);
    try {
      const input: GenerateProcurementListInput = {
        unitIds: values.unitIds,
        startDate: values.startDate,
        endDate: values.endDate,
      };

      const result = await generateProcurementList(input);
      setProcurementList(result);
      toast({
        title: 'Success',
        description: 'Procurement list generated successfully.',
      });
    } catch (error) {
      console.error('Failed to get procurement list:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Could not generate procurement list. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Generate New Order</CardTitle>
            <CardDescription>
              Specify units and a date range to generate a procurement list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Units / Kitchens</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-auto"
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedUnits.length > 0 ? (
                          selectedUnits.map((unitId) => (
                            <Badge key={unitId} variant="secondary">
                              {getUnitName(unitId)}
                            </Badge>
                          ))
                        ) : (
                          <span className="font-normal text-muted-foreground">
                            Select units...
                          </span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search units..." />
                      <CommandList>
                        <CommandEmpty>No units found.</CommandEmpty>
                        <CommandGroup>
                          {units.map((unit) => (
                            <CommandItem
                              key={unit.id}
                              value={unit.id}
                              onSelect={(currentValue) => {
                                const currentSelection = form.getValues('unitIds');
                                if (currentSelection.includes(currentValue)) {
                                  form.setValue('unitIds', currentSelection.filter(id => id !== currentValue));
                                } else {
                                  form.setValue('unitIds', [...currentSelection, currentValue]);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedUnits.includes(unit.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {unit.name} - {unit.mess}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {form.formState.errors.unitIds && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.unitIds.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...form.register('startDate')}
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...form.register('endDate')}
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Procurement List'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Generated Procurement List
          </CardTitle>
          <CardDescription>
            A consolidated list of items to order based on your selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px] max-h-[calc(100vh-22rem)] overflow-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Analyzing menus, strengths, and stock...</p>
            </div>
          )}
          {!isLoading && !procurementList && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Your procurement list will appear here.</p>
            </div>
          )}
          {procurementList && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead className="text-right">Qty to Order</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurementList.itemsToProcure.length > 0 ? (
                  procurementList.itemsToProcure.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.ingredientName}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantityToOrder.toFixed(2)}
                      </TableCell>
                      <TableCell>{item.unitOfMeasure}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No items need to be procured for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
