import type { Category, Ingredient, Dish, Order, UnitOfMeasure } from "./types";

export const categories: Category[] = [
  { id: 'CAT001', name: 'BREAKFAST EGG', description: '' },
  { id: 'CAT002', name: 'BREAKFAST PROTEIN RICH FOOD', description: '' },
  { id: 'CAT003', name: 'LUNCH PROTEIN RICH FOOD (Light)', description: '' },
  { id: 'CAT004', name: 'SUPPER PROTEIN RICH FOOD (Main)', description: '' },
  { id: 'CAT005', name: 'BREAD AND ROLLS', description: '' },
  { id: 'CAT006', name: 'RUSKS and BISCUITS', description: '' },
  { id: 'CAT007', name: 'CONFECTIONARY', description: '' },
  { id: 'CAT008', name: 'MILK PRODUCTS', description: '' },
  { id: 'CAT009', name: 'DAIRY PRODUCTS_CHEESE', description: '' },
  { id: 'CAT010', name: 'DAIRY PRODUCTS_YOGHURT', description: '' },
  { id: 'CAT011', name: 'DAIRY PRODUCTS_EVAP', description: '' },
  { id: 'CAT012', name: 'DAIRY PRODUCTS_ICECREAM', description: '' },
  { id: 'CAT013', name: 'FATS', description: '' },
  { id: 'CAT014', name: 'SUGAR', description: '' },
  { id: 'CAT015', name: 'PORRIDGES', description: '' },
  { id: 'CAT016', name: 'CEREALS', description: '' },
  { id: 'CAT017', name: 'STARCH', description: '' },
  { id: 'CAT018', name: 'VEGETABLES FRESH, FROZEN, PRE-PREPARED', description: '' },
  { id: 'CAT019', name: 'FRESH FRUIT IN SEASON', description: '' },
  { id: 'CAT020', name: 'JAMS and SPREADS', description: '' },
  { id: 'CAT021', name: 'BEVERAGES', description: '' },
  { id: 'CAT022', name: 'FRUIT JUICE', description: '' },
  { id: 'CAT023', name: 'DINNING ROOM COMMODITIES', description: '' },
  { id: 'CAT024', name: 'KITCHEN COMMODITIES and GENERAL ITEMS', description: '' },
  { id: 'CAT025', name: 'HERBS AND SPICES', description: '' },
  { id: 'CAT026', name: 'JELLY POWDERS AND DESSERTS', description: '' },
  { id: 'CAT027', name: 'SOUP POWDER', description: '' },
  { id: 'CAT028', name: 'DESSERT SAUCES', description: '' },
  { id: 'CAT029', name: 'SAUCES&GRAVIES', description: '' },
  { id: 'CAT030', name: 'SUPPLEMENTARY ITEMS', description: '' },
  { id: 'CAT031', name: 'Spreads and Fillings', description: '' },
];

export const unitsOfMeasure: UnitOfMeasure[] = [
    { id: 'uom001', name: 'ea', description: 'Each' },
    { id: 'uom002', name: 'kg', description: 'Kilogram' },
    { id: 'uom003', name: 'g', description: 'Gram' },
    { id: 'uom004', name: 'lt', description: 'Liter' },
    { id: 'uom005', name: 'ml', description: 'Milliliter' },
];

export const ingredients: Ingredient[] = [
  { 
    id: 'P001', 
    name: 'Eggs Large Fresh (B)', 
    categoryId: 'CAT001', 
    variants: [
      { id: 'v001a', packagingSize: '30', unitOfMeasureId: 'uom001', stock: 0 },
      { id: 'v001b', packagingSize: '12', unitOfMeasureId: 'uom001', stock: 0 },
      { id: 'v001c', packagingSize: '1', unitOfMeasureId: 'uom001', stock: 0 },
    ] 
  },
  { 
    id: 'P002', 
    name: 'Eggs Large Fresh (B) (VEG)', 
    categoryId: 'CAT001', 
    variants: [
      { id: 'v002a', packagingSize: '30', unitOfMeasureId: 'uom001', stock: 0 },
      { id: 'v002b', packagingSize: '12', unitOfMeasureId: 'uom001', stock: 0 },
    ] 
  },
  { id: 'P003', name: 'Bacon Sliced Middle (B)', categoryId: 'CAT002', variants: [{ id: 'v003', packagingSize: '1', unitOfMeasureId: 'uom002', stock: 0 }] },
  { 
    id: 'P004', 
    name: 'Bacon Sliced Shoulder (B)', 
    categoryId: 'CAT002', 
    variants: [
      { id: 'v004a', packagingSize: '1', unitOfMeasureId: 'uom002', stock: 0 },
      { id: 'v004b', packagingSize: '500', unitOfMeasureId: 'uom003', stock: 0 },
    ] 
  },
  { id: 'P005', name: 'Bacon Sliced Streaky (B)', categoryId: 'CAT002', variants: [{ id: 'v005', packagingSize: '1', unitOfMeasureId: 'uom002', stock: 0 }] },
  { id: 'P006', name: 'Bean Salad (Sous Bone) (VEG) (B)', categoryId: 'CAT002', variants: [{ id: 'v006', packagingSize: '5', unitOfMeasureId: 'uom004', stock: 0 }] },
  { id: 'P007', name: 'Beans Butter Dry (VEG) (B)', categoryId: 'CAT002', variants: [{ id: 'v007', packagingSize: '1', unitOfMeasureId: 'uom002', stock: 0 }] },
  { 
    id: 'P008', 
    name: 'Beef Ground Mince (B)', 
    categoryId: 'CAT002', 
    variants: [
      { id: 'v008a', packagingSize: '1', unitOfMeasureId: 'uom002', stock: 0 },
      { id: 'v008b', packagingSize: '5', unitOfMeasureId: 'uom002', stock: 0 },
      { id: 'v008c', packagingSize: '500', unitOfMeasureId: 'uom003', stock: 0 },
    ] 
  },
];

export const dishes: Dish[] = [
  // Dishes data removed as it was linked to old ingredients
];

export const orders: Order[] = [
  // Orders data removed as it's not relevant to the new data
];
