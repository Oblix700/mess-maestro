
'use server';
/**
 * @fileOverview A Genkit flow for generating a procurement list.
 * This flow calculates the required ingredients based on menu plans,
 * unit strengths, and current stock levels for a given date range.
 *
 * - generateProcurementList - The main function that triggers the flow.
 * - GenerateProcurementListInput - The input type for the function.
 * - GenerateProcurementListOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  getMenuCycle,
  getStrengthForMonth,
  getIngredients,
  getUoms,
} from '@/lib/firebase/firestore';
import type {
  MenuDefinition,
  MonthlyStrength,
  Ingredient,
  UnitOfMeasure,
} from '@/lib/types';
import { getDayOf28DayCycle } from '@/lib/utils';
import { z } from 'genkit';

export const GenerateProcurementListInputSchema = z.object({
  unitIds: z.array(z.string()).describe('The IDs of the units to generate the list for.'),
  startDate: z.string().describe('The start date of the period (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the period (YYYY-MM-DD).'),
});
export type GenerateProcurementListInput = z.infer<
  typeof GenerateProcurementListInputSchema
>;

export const GenerateProcurementListOutputSchema = z.object({
  itemsToProcure: z.array(
    z.object({
      ingredientId: z.string(),
      ingredientName: z.string(),
      quantityToOrder: z.number(),
      unitOfMeasure: z.string(),
    })
  ),
});
export type GenerateProcurementListOutput = z.infer<
  typeof GenerateProcurementListOutputSchema
>;

// This is a complex flow that doesn't use an LLM prompt but instead
// orchestrates multiple data fetching and calculation steps.
export const generateProcurementList = ai.defineFlow(
  {
    name: 'generateProcurementListFlow',
    inputSchema: GenerateProcurementListInputSchema,
    outputSchema: GenerateProcurementListOutputSchema,
  },
  async ({ unitIds, startDate, endDate }) => {
    // 1. Fetch all necessary data in parallel
    const [allIngredients, allUoms] = await Promise.all([
      getIngredients(),
      getUoms(),
    ]);

    const uomMap = new Map(allUoms.map((uom) => [uom.id, uom.name]));
    const ingredientMap = new Map(
      allIngredients.map((ing) => [ing.id, ing])
    );

    // 2. Calculate total ingredient needs across all units and dates
    const totalRequired = new Map<string, number>();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch strength data for all units and all relevant months
    const strengthsPromises: Promise<{
      unitId: string;
      data: MonthlyStrength | null;
    }>[] = [];
    const uniqueMonths = new Set<string>();
    for (const unitId of unitIds) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
            if (!uniqueMonths.has(`${unitId}-${monthKey}`)) {
                strengthsPromises.push(getStrengthForMonth(unitId, d.getFullYear(), d.getMonth()).then(data => ({ unitId, data })));
                uniqueMonths.add(`${unitId}-${monthKey}`);
            }
        }
    }
    const allStrengthsData = await Promise.all(strengthsPromises);
    const strengthsByUnitMonth = new Map<string, MonthlyStrength | null>();
    allStrengthsData.forEach(item => {
        if(item.data) {
            strengthsByUnitMonth.set(`${item.unitId}_${item.data.year}_${item.data.month}`, item.data);
        }
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const cycleDay = getDayOf28DayCycle(d);
      const menu = await getMenuCycle(cycleDay);

      if (!menu) continue;

      for (const unitId of unitIds) {
        const year = d.getFullYear();
        const month = d.getMonth();
        const dayOfMonth = d.getDate();

        const strengthData = strengthsByUnitMonth.get(`${unitId}_${year}_${month}`);
        const dailyStrength = strengthData?.strengths[dayOfMonth];

        if (!dailyStrength) continue;

        for (const section of menu.sections) {
          for (const item of section.items) {
            if (!item.ingredientId) continue;

            const ingredient = ingredientMap.get(item.ingredientId);
            if (!ingredient) continue;

            // Determine strength percentage for this item
            let strengthPercent = 100; // Default
            if (section.id.includes('breakfast')) strengthPercent = dailyStrength.breakfast;
            if (section.id.includes('luncheon')) strengthPercent = dailyStrength.lunch;
            if (section.id.includes('dinner')) strengthPercent = dailyStrength.supper;
            if (section.id.includes('lunch_packs')) strengthPercent = dailyStrength.lunchPacks;
            if (section.id.includes('scale_m')) strengthPercent = dailyStrength.scaleM;

            // Calculate required amount for this item
            const requiredAmount =
              item.strength * (strengthPercent / 100);

            // Add to total
            const currentTotal = totalRequired.get(item.ingredientId) || 0;
            totalRequired.set(item.ingredientId, currentTotal + requiredAmount);
          }
        }
      }
    }

    // 3. Calculate what needs to be ordered by subtracting current stock
    const itemsToProcure: GenerateProcurementListOutput['itemsToProcure'] = [];

    totalRequired.forEach((requiredQty, ingredientId) => {
      const ingredient = ingredientMap.get(ingredientId);
      if (!ingredient) return;

      // Sum up stock from all variants of an ingredient
      const currentStock = ingredient.variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );

      const quantityToOrder = requiredQty - currentStock;

      if (quantityToOrder > 0) {
        itemsToProcure.push({
          ingredientId,
          ingredientName: ingredient.name,
          quantityToOrder,
          unitOfMeasure: uomMap.get(ingredient.variants[0]?.unitOfMeasureId) || 'units',
        });
      }
    });

    itemsToProcure.sort((a,b) => a.ingredientName.localeCompare(b.ingredientName));

    return { itemsToProcure };
  }
);
