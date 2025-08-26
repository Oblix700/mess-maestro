import type { Dish } from '@/lib/types';

export const dishes: Dish[] = [
  {
    id: 'D001',
    kitchenId: 'all',
    name: 'Scrambled Eggs',
    description: 'Classic scrambled eggs.',
    variants: ['Plain', 'With Cheese'],
    ingredients: [],
  },
  {
    id: 'D002',
    kitchenId: 'all',
    name: 'Beef Stew',
    description: 'Hearty beef stew with vegetables.',
    variants: ['Standard'],
    ingredients: [],
  },
  {
    id: 'D003',
    kitchenId: 'all',
    name: 'Grilled Chicken Salad',
    description: 'Healthy salad with grilled chicken breast.',
    variants: ['Caesar', 'Vinaigrette'],
    ingredients: [],
  },
];
