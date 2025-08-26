
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

const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
const meals = ['Breakfast', 'Lunch', 'Dinner'];

export default function MonthlyMenuPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Monthly Menu</CardTitle>
                <CardDescription>
                Plan and view the menu for the entire month.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select defaultValue="july">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Save Changes</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead className="w-[80px]">Date</TableHead>
                <TableHead>Breakfast</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Dinner</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {daysInMonth.map((day) => (
                    <TableRow key={day}>
                        <TableCell className="font-bold">{day}</TableCell>
                        {meals.map(meal => (
                             <TableCell key={`${day}-${meal}`}>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${meal}...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Populate with dishes */}
                                        <SelectItem value="dish-1">Spaghetti Bolognese</SelectItem>
                                        <SelectItem value="dish-2">Chicken Curry</SelectItem>
                                        <SelectItem value="dish-3">Fish and Chips</SelectItem>
                                    </SelectContent>
                                </Select>
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
