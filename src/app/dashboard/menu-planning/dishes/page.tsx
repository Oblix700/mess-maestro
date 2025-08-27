
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCategories, getIngredients, getDishes } from "@/lib/firebase/firestore";
import { DishesClientPage } from "./dishes-client-page";


export default async function DishesPage() {
    const [categories, ingredients, dishes] = await Promise.all([
        getCategories(),
        getIngredients(),
        getDishes()
    ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient to Dish Mapping</CardTitle>
        <CardDescription>
          Manage which dishes can be prepared with each ingredient. This helps in populating menu plan options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DishesClientPage 
            initialCategories={categories}
            initialIngredients={ingredients}
            initialDishes={dishes}
        />
      </CardContent>
    </Card>
  );
}
