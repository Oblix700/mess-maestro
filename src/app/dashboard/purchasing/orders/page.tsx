
import Link from "next/link";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getOrders } from "@/lib/firebase/firestore";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View past orders and generate new ones.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1" asChild>
            <Link href="/dashboard/purchasing/orders/new">
                <PlusCircle className="h-4 w-4" />
                Create New Order
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-14rem)] overflow-auto border rounded-md">
            <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No orders found.
                        </TableCell>
                    </TableRow>
                ) : (
                    orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{`${order.periodStartDate} to ${order.periodEndDate}`}</TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            order.status === "Completed"
                                ? "default"
                                : order.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className={cn(
                                order.status === 'Completed' && 'bg-green-600 text-white',
                                order.status === 'Pending' && 'bg-amber-500 text-white'
                            )}
                        >
                            {order.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
