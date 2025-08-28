
import type { Ingredient } from '@/lib/types';
import { rationScaleItems, type EnrichedRationScaleItem } from './ration-scale';

// This function transforms the single-source-of-truth ration scale data
// into the format expected by the Ingredients page components.
const transformRationScaleToIngredient = (item: EnrichedRationScaleItem): Ingredient => {
    return {
        id: item.id,
        kitchenId: item.kitchenId,
        name: item.name,
        categoryId: item.categoryId,
        variants: item.variants,
        dishIds: item.dishIds || [],
        isActive: item.isActive,
    };
};

// Generate the ingredients array dynamically from the ration scale data.
export const ingredients: Ingredient[] = rationScaleItems.map(transformRationScaleToIngredient);
