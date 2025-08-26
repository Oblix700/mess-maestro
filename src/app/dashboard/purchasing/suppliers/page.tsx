import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSuppliers } from '@/lib/firebase/firestore';
import { SupplierClientTable } from './supplier-client-table';

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>
            Manage your suppliers and the regions they serve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierClientTable initialSuppliers={suppliers} />
        </CardContent>
      </Card>
    </>
  );
}
