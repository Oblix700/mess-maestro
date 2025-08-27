
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const daysInCycle = Array.from({ length: 28 }, (_, i) => i + 1);
const meals = ['Breakfast', 'Lunch', 'Dinner'];

export default function MonthlyMenuPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>28-Day Cycle Overview</CardTitle>
                <CardDescription>
                High-level view of the 28-day menu cycle.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button>Edit Cycle</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead className="w-[80px]">Day</TableHead>
                <TableHead>Breakfast</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Dinner</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {daysInCycle.map((day) => (
                    <TableRow key={day}>
                        <TableCell className="font-bold">{day}</TableCell>
                        {meals.map(meal => (
                             <TableCell key={`${day}-${meal}`}>
                                <div className="text-sm text-muted-foreground">
                                    View Details
                                </div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
