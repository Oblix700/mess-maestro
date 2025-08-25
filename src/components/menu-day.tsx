
'use client';

import type { MenuDefinition, MealSection, MenuPlanItem } from '@/lib/types';
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
import { categories, rationScaleItems, unitsOfMeasure } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';

interface MenuDayProps {
  menu: MenuDefinition;
  onItemChange: (sectionId: string, itemId: string, updatedValues: Partial<MenuPlanItem>) => void;
}

const getIngredientInfo = (ingredientId: string | null) => {
    if (!ingredientId) return null;
    return rationScaleItems.find(i => i.id === ingredientId);
}

const getUomName = (uomId: string) => {
    return unitsOfMeasure.find(u => u.id === uomId)?.name || '';
}

const MealPlanRow = ({ item, sectionId, onItemChange }: { item: MenuPlanItem, sectionId: string, onItemChange: MenuDayProps['onItemChange'] }) => {
    const ingredient = getIngredientInfo(item.ingredientId);
    const scale = ingredient?.quantity ?? '';
    const uom = ingredient ? getUomName(ingredient.unitOfMeasureId) : '';
  
    const filteredIngredients = React.useMemo(() => {
        return rationScaleItems.filter(i => i.categoryId === item.mealPlanCategoryId);
    }, [item.mealPlanCategoryId])

    const handleIngredientChange = (ingredientId: string) => {
        onItemChange(sectionId, item.id, { ingredientId: ingredientId });
    }
    
    const handleCategoryChange = (categoryId: string) => {
        // When category changes, clear the ingredient as it might not be valid anymore
        onItemChange(sectionId, item.id, { mealPlanCategoryId: categoryId, ingredientId: null });
    }

    return (
        <TableRow>
            <TableCell className="w-[200px]">
                 <Select value={item.mealPlanCategoryId} onValueChange={handleCategoryChange}>
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
            <TableCell className="w-[250px]">
                <Select value={item.ingredientId || ''} onValueChange={handleIngredientChange}>
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
            <TableCell className="w-[100px]">
                <Input value={scale} readOnly className="bg-muted" />
            </TableCell>
            <TableCell className="w-[80px]">
                <Input value={uom} readOnly className="bg-muted" />
            </TableCell>
             <TableCell className="w-[200px]">
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select dish..." />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Dish options will go here */}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="w-[100px]">
                <Input defaultValue={item.strength} type="number" />
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

const MealSectionCard = ({ section, onItemChange }: { section: MealSection, onItemChange: MenuDayProps['onItemChange'] }) => {
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
          <Button variant="ghost" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meal Plan</TableHead>
              <TableHead>Main Ingredient</TableHead>
              <TableHead>Scale</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead>Dish Name</TableHead>
              <TableHead>Strength %</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.items.map((item) => <MealPlanRow key={item.id} item={item} sectionId={section.id} onItemChange={onItemChange} />)}
             {section.items.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No items added to this section.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const MenuDay = ({ menu, onItemChange }: MenuDayProps) => {
  return (
    <div className="space-y-6">
      {menu.sections.map((section) => (
        <MealSectionCard key={section.id} section={section} onItemChange={onItemChange} />
      ))}
    </div>
  );
};
