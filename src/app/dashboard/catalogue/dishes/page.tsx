
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDishes } from "@/lib/firebase/firestore";
import { DishesClientTable } from "./dishes-client-table";

export default async function DishesPage() {
  const dishes = await getDishes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dishes</CardTitle>
        <CardDescription>
          Manage your dishes and their variants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DishesClientTable initialDishes={dishes} />
      </CardContent>
    </Card>
  );
}
