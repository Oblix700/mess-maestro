

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  description: string;
}

export interface IngredientVariant {
  id: string;
  packagingSize: string;
  unitOfMeasureId: string;
  stock: number;
}

export interface Ingredient {
  id:string;
  kitchenId: string; // Added for multi-tenancy
  name: string;
  categoryId: string;
  variants: IngredientVariant[];
}


export interface Dish {
  id: string;
  kitchenId: string; // Added for multi-tenancy
  name: string;
  description: string;
  variants: string[];
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface Order {
  id: string;
  kitchenId: string; // Added for multi-tenancy
  dateGenerated: string;
  dayRange: string;
  status: "Pending" | "Completed" | "Cancelled";
}

export interface RationScaleItem {
    id: string; // This is the ingredientId
    kitchenId: string; // Added for multi-tenancy
    name: string;
    categoryId: string;
    quantity: number;
    unitOfMeasureId: string;
    variants: IngredientVariant[];
}


// Types for the new Menu Plan structure
export interface MenuPlanItem {
    id: string; // Unique ID for the row
    mealPlanCategoryId: string; // ID of the category like 'Fruit in Season'
    ingredientId: string | null;
    dishId: string | null;
    strength: number; // Percentage
}

export interface MealSection {
    id: string; // e.g., 'breakfast'
    title: string; // e.g., 'Breakfast'
    subTitle?: string;
    items: MenuPlanItem[];
}

export interface MenuDefinition {
    day: number;
    kitchenId: string; // Added for multi-tenancy
    sections: MealSection[];
}
