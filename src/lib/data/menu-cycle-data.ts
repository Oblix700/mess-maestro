
import type { MenuDefinition } from '../types';

const createEmptyMenuPlanItem = (i: number) => ({
  id: `item_${Date.now()}_${i}_${Math.random()}`,
  mealPlanCategoryId: '',
  ingredientId: null,
  dishId: null,
  strength: 100,
});

// Helper to create empty sections with 10 placeholder rows
const createSectionsWithPlaceholders = (): MenuDefinition['sections'] => [
  { id: 'breakfast', title: 'Breakfast', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'am_tea', title: 'AM Tea', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'luncheon', title: 'Luncheon', subTitle: 'Light Meal', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'pm_tea', title: 'PM Tea', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'dinner', title: 'Dinner', subTitle: 'Main Meal', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'dining_room', title: 'Dining Room Commodities', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'kitchen_commodities', title: 'Kitchen Commodities', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'herbs_spices', title: 'Herbs and Spices', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'soup_powders', title: 'Soup Powders', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'lunch_packs', title: 'Lunch Packs', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'sustainment_packs', title: 'Sustainment Packs', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'scale_m', title: 'Scale M', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
  { id: 'deployment', title: 'Deployment', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
];


// Generate the full 28-day menu cycle with placeholders
export const menuCycle: MenuDefinition[] = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    sections: createSectionsWithPlaceholders(),
}));


// Overwrite Day 1 data with the specific layout provided previously
const day1Data = {
    day: 1,
    sections: [
      {
        id: 'breakfast',
        title: 'Breakfast',
        items: [
          { id: 'b1', mealPlanCategoryId: 'CAT015', ingredientId: 'P302', dishId: null, strength: 100 },
          { id: 'b2', mealPlanCategoryId: 'CAT008', ingredientId: 'P193', dishId: null, strength: 100 },
          { id: 'b3', mealPlanCategoryId: 'CAT012', ingredientId: 'P218', dishId: null, strength: 100 },
          { id: 'b4', mealPlanCategoryId: 'CAT011', ingredientId: 'P215', dishId: null, strength: 100 },
          { id: 'b5', mealPlanCategoryId: 'CAT007', ingredientId: 'P178', dishId: null, strength: 100 },
          { id: 'b6', mealPlanCategoryId: 'CAT010', ingredientId: 'P212', dishId: null, strength: 100 },
          { id: 'b7', mealPlanCategoryId: 'CAT002', ingredientId: 'P009', dishId: null, strength: 100 },
          { id: 'b8', mealPlanCategoryId: 'CAT001', ingredientId: 'P001', dishId: 'D001', strength: 50 },
          { id: 'b9', mealPlanCategoryId: 'CAT008', ingredientId: 'P186', dishId: null, strength: 100 },
          { id: 'b10', mealPlanCategoryId: 'CAT002', ingredientId: 'P022', dishId: null, strength: 100 },
          { id: 'b11', mealPlanCategoryId: 'CAT005', ingredientId: 'P152', dishId: null, strength: 100 },
          { id: 'b12', mealPlanCategoryId: 'CAT005', ingredientId: 'P156', dishId: null, strength: 100 },
          { id: 'b13', mealPlanCategoryId: 'CAT016', ingredientId: 'P325', dishId: null, strength: 100 },
          { id: 'b14', mealPlanCategoryId: 'CAT009', ingredientId: 'P210', dishId: null, strength: 100 },
          { id: 'b15', mealPlanCategoryId: 'CAT017', ingredientId: 'P335', dishId: null, strength: 100 },
          { id: 'b16', mealPlanCategoryId: 'CAT007', ingredientId: 'P178', dishId: null, strength: 100 },
          { id: 'b17', mealPlanCategoryId: 'CAT010', ingredientId: 'P212', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'am_tea',
        title: 'AM Tea',
        items: [
            { id: 'at1', mealPlanCategoryId: 'CAT017', ingredientId: 'P333', dishId: null, strength: 100 },
            { id: 'at2', mealPlanCategoryId: 'CAT017', ingredientId: 'P335', dishId: null, strength: 100 },
            { id: 'at3', mealPlanCategoryId: 'CAT007', ingredientId: 'P178', dishId: null, strength: 100 },
            { id: 'at4', mealPlanCategoryId: 'CAT010', ingredientId: 'P212', dishId: null, strength: 100 },
            { id: 'at5', mealPlanCategoryId: 'CAT005', ingredientId: 'P156', dishId: null, strength: 100 },
            { id: 'at6', mealPlanCategoryId: 'CAT006', ingredientId: 'P170', dishId: null, strength: 100 },
            { id: 'at7', mealPlanCategoryId: 'CAT009', ingredientId: 'P208', dishId: null, strength: 100 },
            { id: 'at8', mealPlanCategoryId: 'CAT016', ingredientId: 'P331', dishId: null, strength: 100 },
            { id: 'at9', mealPlanCategoryId: 'CAT022', ingredientId: null, dishId: null, strength: 100 },
            { id: 'at10', mealPlanCategoryId: 'CAT016', ingredientId: 'P332', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'luncheon',
        title: 'Luncheon',
        subTitle: 'Light Meal',
        items: [
            { id: 'l1', mealPlanCategoryId: 'CAT003', ingredientId: 'P044', dishId: null, strength: 100 },
            { id: 'l2', mealPlanCategoryId: 'CAT025', ingredientId: null, dishId: null, strength: 100 },
            { id: 'l3', mealPlanCategoryId: 'CAT013', ingredientId: 'P236', dishId: null, strength: 100 },
            { id: 'l4', mealPlanCategoryId: 'CAT014', ingredientId: 'P253', dishId: null, strength: 100 },
            { id: 'l5', mealPlanCategoryId: 'CAT022', ingredientId: 'P498', dishId: null, strength: 100 },
            { id: 'l6', mealPlanCategoryId: 'CAT025', ingredientId: 'P550', dishId: null, strength: 100 },
            { id: 'l7', mealPlanCategoryId: 'CAT015', ingredientId: 'P312', dishId: null, strength: 100 },
            { id: 'l8', mealPlanCategoryId: 'CAT005', ingredientId: 'P157', dishId: null, strength: 100 },
            { id: 'l9', mealPlanCategoryId: 'CAT017', ingredientId: 'P340', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'pm_tea',
        title: 'PM Tea',
        items: [
            { id: 'pt1', mealPlanCategoryId: 'CAT017', ingredientId: 'P333', dishId: null, strength: 100 },
            { id: 'pt2', mealPlanCategoryId: 'CAT017', ingredientId: 'P334', dishId: null, strength: 100 },
            { id: 'pt3', mealPlanCategoryId: 'CAT007', ingredientId: 'P178', dishId: null, strength: 100 },
            { id: 'pt4', mealPlanCategoryId: 'CAT010', ingredientId: 'P212', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'dinner',
        title: 'Dinner',
        subTitle: 'Main Meal',
        items: [
            { id: 'd1', mealPlanCategoryId: 'CAT004', ingredientId: 'P106', dishId: null, strength: 100 },
            { id: 'd2', mealPlanCategoryId: 'CAT025', ingredientId: null, dishId: null, strength: 100 },
            { id: 'd3', mealPlanCategoryId: 'CAT013', ingredientId: 'P226', dishId: null, strength: 100 },
            { id: 'd4', mealPlanCategoryId: 'CAT014', ingredientId: 'P260', dishId: null, strength: 100 },
            { id: 'd5', mealPlanCategoryId: 'CAT022', ingredientId: 'P507', dishId: null, strength: 100 },
            { id: 'd6', mealPlanCategoryId: 'CAT025', ingredientId: 'P540', dishId: null, strength: 100 },
            { id: 'd7', mealPlanCategoryId: 'CAT015', ingredientId: 'P306', dishId: null, strength: 100 },
            { id: 'd8', mealPlanCategoryId: 'CAT005', ingredientId: 'P156', dishId: null, strength: 100 },
            { id: 'd9', mealPlanCategoryId: 'CAT017', ingredientId: 'P335', dishId: null, strength: 100 },
            { id: 'd10', mealPlanCategoryId: 'CAT017', ingredientId: 'P333', dishId: null, strength: 100 },
        ],
      },
      { id: 'dining_room', title: 'Dining Room Commodities', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
      { id: 'kitchen_commodities', title: 'Kitchen Commodities', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
      { id: 'herbs_spices', title: 'Herbs and Spices', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
      { id: 'soup_powders', title: 'Soup Powders', items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)) },
      {
        id: 'lunch_packs',
        title: 'Lunch Packs',
        items: [
          { id: 'lp1', mealPlanCategoryId: 'CAT024', ingredientId: 'P521', dishId: null, strength: 100 },
          { id: 'lp2', mealPlanCategoryId: 'CAT024', ingredientId: 'P519', dishId: null, strength: 100 },
          { id: 'lp3', mealPlanCategoryId: 'CAT024', ingredientId: 'P538', dishId: null, strength: 100 },
          { id: 'lp4', mealPlanCategoryId: 'CAT024', ingredientId: 'P517', dishId: null, strength: 100 },
          { id: 'lp5', mealPlanCategoryId: 'CAT018', ingredientId: 'P359', dishId: null, strength: 100 },
          { id: 'lp6', mealPlanCategoryId: 'CAT024', ingredientId: 'P516', dishId: null, strength: 100 },
          { id: 'lp7', mealPlanCategoryId: 'CAT015', ingredientId: 'P302', dishId: null, strength: 100 },
          { id: 'lp8', mealPlanCategoryId: 'CAT005', ingredientId: 'P156', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'sustainment_packs',
        title: 'Sustainment Packs',
        items: [
            { id: 'sp1', mealPlanCategoryId: 'CAT001', ingredientId: 'P001', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'scale_m',
        title: 'Scale M',
        items: [
             { id: 'sm1', mealPlanCategoryId: 'CAT001', ingredientId: 'P002', dishId: null, strength: 100 },
        ],
      },
      {
        id: 'deployment',
        title: 'Deployment',
        items: Array.from({ length: 10 }, (_, i) => createEmptyMenuPlanItem(i)),
      }
    ],
};

// Find the index for day 1 and replace it with the detailed data
const day1Index = menuCycle.findIndex(m => m.day === 1);
if (day1Index !== -1) {
    menuCycle[day1Index] = day1Data;
}
