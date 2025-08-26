
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Calendar</CardTitle>
        <CardDescription>
          Visualize your menu plan on a calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
            mode="single"
            className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
