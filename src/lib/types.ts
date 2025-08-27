

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface UnitOfMeasure {
  id:string;
  name: string;
  description: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Unit {
  id: string; 
  name: string;
  mess: string;
  regions?: string[];
  supplierAccounts?: { supplierId: string; accountNumber: string }[];
}

export interface IngredientVariant {
  id: string;
  packagingSize: string;
  unitOfMeasureId: string;
  stock: number;
}

export interface Ingredient {
  id: string;
  kitchenId: string; // Added for multi-tenancy
  name: string;
  categoryId: string;
  variants: IngredientVariant[];
  dishIds?: string[];
}

export interface Dish {
  id: string;
  kitchenId: string; // Added for multi-tenancy
  name: string;
  description: string;
  variants: string[];
  ingredients: { ingredientId: string; quantity: number }[];
}

export interface OrderItem {
  ingredientId: string;
  ingredientName: string;
  quantityToOrder: number;
  unitOfMeasure: string;
}

export interface Order {
  id: string;
  orderDate: string;
  periodStartDate: string;
  periodEndDate: string;
  unitIds: string[];
  status: 'Pending' | 'Completed' | 'Cancelled';
  items: OrderItem[];
}

export interface RationScaleItem {
  id: string; // This is the ingredientId
  kitchenId: string; // Added for multi-tenancy
  name: string;
  categoryId: string;
  quantity: number;
  unitOfMeasureId: string;
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
  kitchenId?: string; // Added for multi-tenancy
  sections: MealSection[];
}

export interface User {
    id: string; // Service number
    name: string;
    role: 'admin' | 'mess_staff';
    kitchenId?: string; // Only for mess_staff
}

export interface Supplier {
    id: string;
    kitchenId?: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    regions: string[];
}

export interface DailyStrength {
    breakfast: number;
    lunch: number;
    supper: number;
    lunchPacks: number;
    scaleM: number;
    deployment: number;
}

export interface MonthlyStrength {
    id: string; // Format: {unitId}_{year}_{month} e.g., "16_2024_7"
    unitId: string;
    year: number;
    month: number; // 0-11
    strengths: {
        [day: number]: DailyStrength; // day is 1-31
    };
}

    