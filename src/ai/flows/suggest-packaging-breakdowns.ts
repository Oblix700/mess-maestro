'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal packaging breakdowns for generated orders.
 *
 * It takes into account historical data, preferences, and remainders to minimize waste and streamline the packaging process.
 *
 * - suggestPackagingBreakdowns - The main function that triggers the flow.
 * - SuggestPackagingBreakdownsInput - The input type for the suggestPackagingBreakdowns function.
 * - SuggestPackagingBreakdownsOutput - The return type for the suggestPackagingBreakdowns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPackagingBreakdownsInputSchema = z.object({
  orderItems: z
    .array(
      z.object({
        ingredient: z.string().describe('The ingredient name.'),
        quantity: z.number().describe('The quantity of the ingredient needed.'),
        unitOfMeasure: z.string().describe('The unit of measure for the ingredient.'),
      })
    )
    .describe('The list of order items with ingredient details.'),
  historicalData: z
    .string()
    .optional()
    .describe('Historical packaging data, preferences, and remainders.'),
  preferences: z.string().optional().describe('Packaging preferences.'),
  remainders: z.string().optional().describe('Information about remainders.'),
});

export type SuggestPackagingBreakdownsInput = z.infer<
  typeof SuggestPackagingBreakdownsInputSchema
>;

const SuggestPackagingBreakdownsOutputSchema = z.object({
  packagingSuggestions: z
    .array(
      z.object({
        ingredient: z.string().describe('The ingredient name.'),
        packagingType: z.string().describe('Suggested packaging type.'),
        quantity: z.number().describe('Quantity to be packaged.'),
        unitOfMeasure: z.string().describe('The unit of measure for the quantity.'),
        notes: z.string().optional().describe('Additional notes or considerations.'),
      })
    )
    .describe('The suggested packaging breakdown for each ingredient.'),
});

export type SuggestPackagingBreakdownsOutput = z.infer<
  typeof SuggestPackagingBreakdownsOutputSchema
>;

export async function suggestPackagingBreakdowns(
  input: SuggestPackagingBreakdownsInput
): Promise<SuggestPackagingBreakdownsOutput> {
  return suggestPackagingBreakdownsFlow(input);
}

const suggestPackagingBreakdownsPrompt = ai.definePrompt({
  name: 'suggestPackagingBreakdownsPrompt',
  input: {schema: SuggestPackagingBreakdownsInputSchema},
  output: {schema: SuggestPackagingBreakdownsOutputSchema},
  prompt: `You are an expert kitchen manager assistant. You will suggest the optimal packaging breakdowns for generated orders, taking into account historical data, preferences, and remainders, to minimize waste and streamline the packaging process.

Here are the order items:
{{#each orderItems}}
- Ingredient: {{ingredient}}, Quantity: {{quantity}} {{unitOfMeasure}}
{{/each}}

Historical Data: {{historicalData}}
Preferences: {{preferences}}
Remainders: {{remainders}}

Suggest packaging breakdowns for each ingredient, including packaging type, quantity, and any relevant notes.

Output the packaging suggestions in JSON format.
`,
});

const suggestPackagingBreakdownsFlow = ai.defineFlow(
  {
    name: 'suggestPackagingBreakdownsFlow',
    inputSchema: SuggestPackagingBreakdownsInputSchema,
    outputSchema: SuggestPackagingBreakdownsOutputSchema,
  },
  async input => {
    const {output} = await suggestPackagingBreakdownsPrompt(input);
    return output!;
  }
);
