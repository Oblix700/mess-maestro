
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MonthlyShoppingListPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Shopping List</CardTitle>
        <CardDescription>
          This will show an aggregated list of ingredients and quantities for a selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Placeholder content for the Monthly Shopping List.</p>
      </CardContent>
    </Card>
  );
}
