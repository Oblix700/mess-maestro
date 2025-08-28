
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UomClientTable } from './uom-client-table';

export default function UomPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Units of Measure (UOM)</CardTitle>
          <CardDescription>
            Manage your units of measure for ingredients in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UomClientTable />
        </CardContent>
      </Card>
    </>
  );
}
