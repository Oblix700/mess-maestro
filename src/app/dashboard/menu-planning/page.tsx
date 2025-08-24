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
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MenuCell = () => {
  // In a real app, this would trigger a dialog to select a dish
  return (
    <Button variant="ghost" size="sm" className="w-full h-full text-xs justify-start">
      + Add dish
    </Button>
  );
};

export default function MenuPlanningPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>28-Day Menu Cycle</CardTitle>
        <CardDescription>
          Plan your meals for a full 28-day cycle. Click on a slot to add a dish.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Day</TableHead>
                <TableHead className="w-[100px]">Weekday</TableHead>
                <TableHead>Breakfast</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Dinner</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 28 }, (_, i) => (
                <TableRow key={i}>
                    <TableCell className="font-medium text-center">{i + 1}</TableCell>
                    <TableCell>{daysOfWeek[i % 7]}</TableCell>
                    <TableCell className="p-1"><MenuCell /></TableCell>
                    <TableCell className="p-1"><MenuCell /></TableCell>
                    <TableCell className="p-1"><MenuCell /></TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
