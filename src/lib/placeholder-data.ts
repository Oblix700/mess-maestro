import type { Category, Ingredient, Dish, Order } from "./types";

export const categories: Category[] = [
  { id: "cat1", name: "Dairy", description: "Milk, cheese, and yogurt products" },
  { id: "cat2", name: "Vegetables", description: "Fresh and frozen vegetables" },
  { id: "cat3", name: "Meat", description: "All kinds of meat products" },
  { id: "cat4", name: "Grains", description: "Cereals, bread, and pasta" },
  { id: "cat5", name: "Spices", description: "Herbs and spices" },
];

export const ingredients: Ingredient[] = [
  { id: "ing1", name: "Milk", categoryId: "cat1", unitOfMeasure: "Liters", stock: 100 },
  { id: "ing2", name: "Carrot", categoryId: "cat2", unitOfMeasure: "kg", stock: 50 },
  { id: "ing3", name: "Chicken Breast", categoryId: "cat3", unitOfMeasure: "kg", stock: 80 },
  { id: "ing4", name: "Rice", categoryId: "cat4", unitOfMeasure: "kg", stock: 200 },
  { id: "ing5", name: "Turmeric", categoryId: "cat5", unitOfMeasure: "grams", stock: 1000 },
  { id: "ing6", name: "Potato", categoryId: "cat2", unitOfMeasure: "kg", stock: 150 },
  { id: "ing7", name: "Beef Mince", categoryId: "cat3", unitOfMeasure: "kg", stock: 60 },
];

export const dishes: Dish[] = [
  {
    id: "dish1",
    name: "Chicken Curry",
    description: "A classic spicy chicken curry.",
    variants: ["Spicy", "Mild"],
    ingredients: [
      { ingredientId: "ing3", quantity: 0.2 },
      { ingredientId: "ing5", quantity: 5 },
      { ingredientId: "ing6", quantity: 0.15 },
    ],
  },
  {
    id: "dish2",
    name: "Vegetable Stir Fry",
    description: "A healthy mix of fresh vegetables.",
    variants: ["Standard", "Extra Tofu"],
    ingredients: [
        { ingredientId: "ing2", quantity: 0.1 },
        { ingredientId: "ing6", quantity: 0.1 }
    ],
  },
  {
    id: "dish3",
    name: "Rice Pudding",
    description: "A creamy and sweet dessert.",
    variants: [],
    ingredients: [
        { ingredientId: "ing1", quantity: 0.25 },
        { ingredientId: "ing4", quantity: 0.1 }
    ],
  },
  {
    id: "dish4",
    name: "Shepherd's Pie",
    description: "Hearty and comforting beef and potato pie.",
    variants: ["Standard", "Cheesy Mash"],
    ingredients: [
        { ingredientId: "ing7", quantity: 0.2 },
        { ingredientId: "ing6", quantity: 0.3 }
    ],
  },
];

export const orders: Order[] = [
    { id: 'ORD-001', dateGenerated: '2023-10-01', dayRange: '1-7', status: 'Completed' },
    { id: 'ORD-002', dateGenerated: '2023-10-08', dayRange: '8-14', status: 'Completed' },
    { id: 'ORD-003', dateGenerated: '2023-10-15', dayRange: '15-21', status: 'Pending' },
    { id: 'ORD-004', dateGenerated: '2023-09-24', dayRange: '22-28', status: 'Cancelled' },
];
