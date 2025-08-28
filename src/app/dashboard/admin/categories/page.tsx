
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoriesClientTable } from './categories-client-table';

export default function CategoriesPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Food Categories</CardTitle>
          <CardDescription>
            Manage your food categories. Add, edit, or delete them in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesClientTable />
        </CardContent>
      </Card>
    </>
  );
}
