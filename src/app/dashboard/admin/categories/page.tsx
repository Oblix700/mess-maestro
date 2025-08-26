
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCategories } from '@/lib/firebase/firestore';
import { CategoriesClientTable } from './categories-client-table';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Food Categories</CardTitle>
          <CardDescription>
            Manage your food categories. Add, edit, or delete them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesClientTable initialCategories={categories} />
        </CardContent>
      </Card>
    </>
  );
}
