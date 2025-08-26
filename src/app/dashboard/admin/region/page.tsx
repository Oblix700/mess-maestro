
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getRegions } from '@/lib/firebase/firestore';
import { RegionClientTable } from './region-client-table';

export default async function RegionPage() {
  const regions = await getRegions();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regions</CardTitle>
          <CardDescription>
            Manage the geographic regions for units and suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegionClientTable initialRegions={regions} />
        </CardContent>
      </Card>
    </>
  );
}
