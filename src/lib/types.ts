export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Ingredient {
  id: string;
  name: string;
  categoryId: string;
  unitOfMeasure: string;
  stock: number;
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
