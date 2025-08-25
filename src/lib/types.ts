
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
  name: string;
  categoryId: string;
  variants: IngredientVariant[];
}


export interface Dish {
  id: string;
  name: string;
  description: string;
  variants: string[];
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface MenuItem {
  day: number;
  meal: "Breakfast" | "Lunch" | "Dinner";
  dishId: string | null;
}

export interface Order {
  id: string;
  dateGenerated: string;
  dayRange: string;
  status: "Pending" | "Completed" | "Cancelled";
}

export interface RationScaleItem {
    id: string; // This is the ingredientId
    quantity: number;
    unitOfMeasureId: string;
}
