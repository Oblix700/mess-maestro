
import type { Category } from '@/lib/types';

// This is the master list of all possible categories.
// It acts as a source of truth for category details like descriptions.
const allCategoriesMaster: Category[] = [
    { id: 'CAT001', name: 'BREAKFAST EGG', description: '' },
    { id: 'CAT002', name: 'BREAKFAST PROTEIN RICH FOOD', description: '' },
    { id: 'CAT003', name: 'LUNCH PROTEIN RICH FOOD (Light)', description: '' },
    { id: 'CAT004', name: 'SUPPER PROTEIN RICH FOOD (Main)', description: '' },
    { id: 'CAT005', name: 'BREAD AND ROLLS', description: '' },
    { id: 'CAT006', name: 'RUSKS and BISCUITS', description: '' },
    { id: 'CAT007', name: 'MILK PRODUCTS', description: '' },
    { id: 'CAT008', name: 'DAIRY PRODUCTS', description: '' },
    { id: 'CAT009', name: 'FATS', description: '' },
    { id: 'CAT010', name: 'SUGAR', description: '' },
    { id: 'CAT011', name: 'PORRIDGES', description: '' },
    { id: 'CAT012', name: 'CEREALS', description: '' },
    { id: 'CAT013', name: 'STARCH', description: '' },
    { id: 'CAT014', name: 'VEGETABLES FRESH, FROZEN, PRE-PREPARED', description: '' },
    { id: 'CAT015', name: 'FRESH FRUIT IN SEASON', description: '' },
    { id: 'CAT016', name: 'JAMS and SPREADS', description: '' },
    { id: 'CAT017', name: 'BEVERAGES', description: '' },
    { id: 'CAT018', name: 'FRUIT JUICE', description: '' },
    { id: 'CAT019', name: 'DINNING ROOM COMMODITIES', description: '' },
    { id: 'CAT020', name: 'KITCHEN COMMODITIES and GENERAL ITEMS', description: '' },
    { id: 'CAT021', name: 'HERBS AND SPICES', description: '' },
    { id: 'CAT022', name: 'JELLY POWDERS AND DESSERTS', description: '' },
    { id: 'CAT023', name: 'SOUP POWDER', description: '' },
    { id: 'CAT024', name: 'SACHET/PORTIONS FOR TAKE-AWAY MEALS', description: '' },
    { id: 'CAT025', name: 'DESSERT SAUCES', description: '' },
    { id: 'CAT026', name: 'LUNCH PACKS', description: '' },
    { id: 'CAT027', name: 'SUSTAINMENT PACKS', description: '' },
    { id: 'CAT028', name: 'Scale M', description: '' },
];


// We export the master list directly. The UI will now be responsible for filtering
// or showing all categories as needed. This ensures that even if a category
// has no ingredients yet, it can still be managed in the admin UI.
export const categories: Category[] = allCategoriesMaster;

    