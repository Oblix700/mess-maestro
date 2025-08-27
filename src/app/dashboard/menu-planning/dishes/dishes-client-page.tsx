
'use client';

import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category, Ingredient, Dish } from '@/lib/types';
import { Check, ChevronsUpDown, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { updateIngredientDishes } from '@/lib/firebase/firestore';

interface DishesClientPageProps {
  initialCategories: Category[];
  initialIngredients: Ingredient[];
  initialDishes: Dish[];
}

export function DishesClientPage({ initialCategories, initialIngredients, initialDishes }: DishesClientPageProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const ingredientsByCategory = useMemo(() => {
    const grouped: { [key: string]: Ingredient[] } = {};
    initialCategories.forEach(cat => {
      grouped[cat.id] = ingredients.filter(ing => ing.categoryId === cat.id);
    });
    return grouped;
  }, [initialCategories, ingredients]);

  const getDishName = (dishId: string) => {
    return initialDishes.find(d => d.id === dishId)?.name || 'Unknown Dish';
  };
  
  const handleDishToggle = (ingredientId: string, dishId: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ing => {
        if (ing.id === ingredientId) {
          const dishIds = ing.dishIds || [];
          const newDishIds = dishIds.includes(dishId)
            ? dishIds.filter(id => id !== dishId)
            : [...dishIds, dishId];
          return { ...ing, dishIds: newDishIds };
        }
        return ing;
      })
    );
  };
  
  const handleSaveChanges = async (ingredientId: string) => {
    const ingredientToSave = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredientToSave) return;
    
    setIsSaving(true);
    try {
      await updateIngredientDishes(ingredientId, ingredientToSave.dishIds || []);
      toast({
        title: "Success",
        description: `Dishes for ${ingredientToSave.name} have been updated.`,
      });
    } catch (error) {
      console.error("Error saving dishes for ingredient:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Accordion type="multiple" className="w-full">
      {initialCategories.map(category => (
        ingredientsByCategory[category.id]?.length > 0 && (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger>{category.name} ({ingredientsByCategory[category.id].length})</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {ingredientsByCategory[category.id].map(ingredient => (
                  <div key={ingredient.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{ingredient.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                            {(ingredient.dishIds || []).map(dishId => (
                                <Badge key={dishId} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                                <span>{getDishName(dishId)}</span>
                                <button
                                    onClick={() => handleDishToggle(ingredient.id, dishId)}
                                    className="ml-1 rounded-full opacity-50 hover:opacity-100 hover:bg-destructive/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove dish</span>
                                </button>
                                </Badge>
                            ))}
                            </div>
                        </div>
                       <div className="flex items-center gap-2">
                         <Popover open={openPopover === ingredient.id} onOpenChange={(isOpen) => setOpenPopover(isOpen ? ingredient.id : null)}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                className="w-[200px] justify-between"
                                >
                                Add Dish
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                <CommandInput placeholder="Search dishes..." />
                                <CommandList>
                                    <CommandEmpty>No dishes found.</CommandEmpty>
                                    <CommandGroup>
                                    {initialDishes.map(dish => (
                                        <CommandItem
                                        key={dish.id}
                                        value={dish.name}
                                        onSelect={() => {
                                            handleDishToggle(ingredient.id, dish.id);
                                        }}
                                        >
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            (ingredient.dishIds || []).includes(dish.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {dish.name}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                            </Popover>
                             <Button size="sm" onClick={() => handleSaveChanges(ingredient.id)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                             </Button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      ))}
    </Accordion>
  );
}

