
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MenuPlanningPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Planning</CardTitle>
        <CardDescription>
          Tools and templates for planning your menus.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>This is the central hub for menu planning.</p>
        <p>Please select a specific planning tool from the sidebar navigation.</p>
         <div className="flex gap-4">
             <Button asChild>
                <Link href="/dashboard/menu-planning/28-day-menu-cycle">
                    Go to 28-Day Cycle
                </Link>
             </Button>
             <Button asChild variant="outline">
                <Link href="/dashboard/menu-planning/calendar">
                    Go to Year Planner
                </Link>
             </Button>
         </div>
      </CardContent>
    </Card>
  );
}
