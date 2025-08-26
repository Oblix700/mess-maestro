import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getUoms } from '@/lib/firebase/firestore';
import { UomActions } from './uom-actions';

export default async function UomPage() {
  const uoms = await getUoms();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Units of Measure (UOM)</CardTitle>
              <CardDescription>
                Manage your units of measure for ingredients.
              </CardDescription>
            </div>
            {/* TODO: Add functionality for the Add button */}
            <Button size="sm" className="gap-1" disabled>
              <PlusCircle className="h-4 w-4" />
              Add UOM
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uoms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No UOMs found.</TableCell>
                  </TableRow>
                ) : uoms.map((uom) => (
                  <TableRow key={uom.id}>
                    <TableCell className="font-medium">{uom.name}</TableCell>
                    <TableCell>{uom.description}</TableCell>
                    <TableCell>
                      <UomActions uom={uom} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
