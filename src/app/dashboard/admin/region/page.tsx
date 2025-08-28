
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegionClientTable } from './region-client-table';

export default function RegionPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regions</CardTitle>
          <CardDescription>
            Manage the geographic regions for units and suppliers in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegionClientTable />
        </CardContent>
      </Card>
    </>
  );
}
