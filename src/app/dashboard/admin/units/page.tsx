
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUnits, getSuppliers, getRegions } from '@/lib/firebase/firestore';
import { UnitsClient } from './units-client';

export default async function UnitsPage() {
  const unitsData = await getUnits();
  const suppliersData = await getSuppliers();
  const regionsData = await getRegions();

  unitsData.sort((a, b) => {
    const aNum = parseInt(a.id.replace(/\D/g,''), 10);
    const bNum = parseInt(b.id.replace(/\D/g,''), 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>
            Manage your kitchens, messes, and their supplier account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnitsClient 
            initialUnits={unitsData}
            initialSuppliers={suppliersData}
            initialRegions={regionsData}
          />
        </CardContent>
      </Card>
    </>
  );
}
