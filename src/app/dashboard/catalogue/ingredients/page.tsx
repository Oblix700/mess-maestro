
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IngredientsClientTable } from './ingredients-client-table';

export default function IngredientsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ingredients Catalogue</CardTitle>
                <CardDescription>
                View and manage your master ingredients list and their packaging sizes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <IngredientsClientTable />
            </CardContent>
        </Card>
    )
}
