import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUoms } from '@/lib/firebase/firestore';
import { UomClientTable } from './uom-client-table';

export default async function UomPage() {
  const uoms = await getUoms();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Units of Measure (UOM)</CardTitle>
          <CardDescription>
            Manage your units of measure for ingredients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UomClientTable initialUoms={uoms} />
        </CardContent>
      </Card>
    </>
  );
}
