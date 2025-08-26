
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCategories, getIngredients, getUoms } from '@/lib/firebase/firestore';
import { IngredientsClientTable } from './ingredients-client-table';

export default async function IngredientsPage() {
    const [ingredientsData, categoriesData, uomData] = await Promise.all([
        getIngredients(),
        getCategories(),
        getUoms(),
    ]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                Manage your ingredients and their packaging sizes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <IngredientsClientTable 
                    initialIngredients={ingredientsData}
                    initialCategories={categoriesData}
                    initialUoms={uomData}
                />
            </CardContent>
        </Card>
    )
}
