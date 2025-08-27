
'use client';

import type { MenuDefinition, MealSection, MenuPlanItem, Category, RationScaleItem, UnitOfMeasure, Dish } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';

type SectionFilter = 'kitchen' | 'lunch_packs' | 'sustainment_packs' | 'scale_m' | 'deployment';
const KITCHEN_SECTION_IDS = ['breakfast', 'am_tea', 'luncheon', 'pm_tea', 'dinner', 'dining_room', 'kitchen_commodities', 'herbs_spices', 'soup_powders'];


interface MenuDayProps {
  menu: MenuDefinition;
  onItemChange: (sectionId: string, itemId: string, updatedValues: Partial<MenuPlanItem>) => void;
  onAddItem: (sectionId: string, afterItemId: string) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
  categories: Category[];
  rationScaleItems: RationScaleItem[];
  unitsOfMeasure: UnitOfMeasure[];
  dishes: Dish[];
  filter: SectionFilter;
}

interface MealPlanRowProps {
    item: MenuPlanItem;
    sectionId: string;
    onItemChange: MenuDayProps['onItemChange'];
    onAddItem: MenuDayProps['onAddItem'];
    onRemoveItem: MenuDayProps['onRemoveItem'];
    categories: Category[];
    rationScaleItems: RationScaleItem[];
    unitsOfMeasure: UnitOfMeasure[];
    dishes: Dish[];
}


const MealPlanRow = ({ item, sectionId, onItemChange, onAddItem, onRemoveItem, categories, rationScaleItems, unitsOfMeasure, dishes }: MealPlanRowProps) => {
    const getIngredientInfo = (ingredientId: string | null) => {
      if (!ingredientId) return null;
      return rationScaleItems.find(i => i.id === ingredientId);
    }

    const getUomName = (uomId: string) => {
        return unitsOfMeasure.find(u => u.id === uomId)?.name || '';
    }
    
    const ingredient = getIngredientInfo(item.ingredientId);
    const scale = ingredient?.quantity ?? '';
    const uom = ingredient ? getUomName(ingredient.unitOfMeasureId) : '';
  
    const filteredIngredients = useMemo(() => {
        if (!item.mealPlanCategoryId) return [];
        return rationScaleItems.filter(i => i.categoryId === item.mealPlanCategoryId);
    }, [item.mealPlanCategoryId, rationScaleItems])

    const handleIngredientChange = (ingredientId: string) => {
        onItemChange(sectionId, item.id, { 
            ingredientId: ingredientId,
            dishId: null // Reset dish when ingredient changes
        });
    }
    
    const handleCategoryChange = (categoryId: string) => {
        onItemChange(sectionId, item.id, { mealPlanCategoryId: categoryId, ingredientId: null, dishId: null });
    }
    
    const handleDishChange = (dishId: string) => {
        onItemChange(sectionId, item.id, { dishId });
    }
    
    const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onItemChange(sectionId, item.id, { strength: Number(value) });
    }


    return (
        <TableRow>
            <TableCell className="p-2 w-[40px]">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onAddItem(sectionId, item.id)}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="p-2">
                 <Select value={item.mealPlanCategoryId || ''} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="p-2">
                <Select value={item.ingredientId || ''} onValueChange={handleIngredientChange} disabled={!item.mealPlanCategoryId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select ingredient..." />
                    </SelectTrigger>
                    <SelectContent>
                         {filteredIngredients.map(ing => (
                            <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="p-2">
                <Input value={scale} readOnly className="bg-muted" />
            </TableCell>
            <TableCell className="p-2">
                <Input value={uom} readOnly className="bg-muted" />
            </TableCell>
             <TableCell className="p-2">
                <Select value={item.dishId || ''} onValueChange={handleDishChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select dish..." />
                    </SelectTrigger>
                    <SelectContent>
                        {dishes.map(dish => (
                            <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="p-2">
                <Input defaultValue={item.strength} type="number" onChange={handleStrengthChange} />
            </TableCell>
            <TableCell className="text-right p-2">
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onRemoveItem(sectionId, item.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

const MealSectionCard = ({ section, ...props }: { section: MealSection } & Omit<MenuDayProps, 'menu' | 'filter'>) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{section.title}</CardTitle>
            {section.subTitle && (
              <CardDescription>{section.subTitle}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[450px] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead className="p-2 w-[40px]"><span className="sr-only">Add</span></TableHead>
                <TableHead className="p-2 w-1/4">Meal Plan</TableHead>
                <TableHead className="p-2 w-1/4">Main Ingredient</TableHead>
                <TableHead className="p-2 w-[100px]">Scale</TableHead>
                <TableHead className="p-2 w-[80px]">UoM</TableHead>
                <TableHead className="p-2 w-1/6">Dish Name</TableHead>
                <TableHead className="p-2 w-[120px]">Strength %</TableHead>
                <TableHead className="p-2 w-[50px]"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {section.items.map((item) => <MealPlanRow key={item.id} item={item} sectionId={section.id} {...props} />)}
                {section.items.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-4">
                            No items added to this section.
                             <Button variant="link" onClick={() => props.onAddItem(section.id, '')}>Add the first item</Button>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export const MenuDay = ({ menu, onItemChange, onAddItem, onRemoveItem, categories, rationScaleItems, unitsOfMeasure, dishes, filter }: MenuDayProps) => {
  const componentProps = { onItemChange, onAddItem, onRemoveItem, categories, rationScaleItems, unitsOfMeasure, dishes };
  
  const filteredSections = useMemo(() => {
    if (!menu) return [];
    if (filter === 'kitchen') {
      return menu.sections.filter(s => KITCHEN_SECTION_IDS.includes(s.id));
    }
    return menu.sections.filter(s => s.id === filter);
  }, [menu, filter]);

  return (
    <div className="space-y-6">
      {filteredSections.map((section) => (
        <MealSectionCard key={section.id} section={section} {...componentProps} />
      ))}
    </div>
  );
};
