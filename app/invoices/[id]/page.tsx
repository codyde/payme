import { validateRequest } from "@/lib/auth/lucia";
import { db } from "@/db";
import { invoices, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import TransactionsTable from "@/components/TransactionsTable";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return <div>Unauthorized</div>;
  }

  const invoiceId = params.id;

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const invoiceTransactionList = await db
  .select()
  .from(transactions)
  .where(eq(transactions.invoiceId, invoiceId));

  const totalAmount = invoiceTransactionList.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  await console.log(invoiceTransactionList);
  await console.log(totalAmount);



  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice Name</p>
              <p className="text-lg font-semibold">{invoice.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-lg font-semibold">{invoice.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Billable Person</p>
              <p className="text-lg">{invoice.billablePerson}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{invoice.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TransactionsTable userId={user.id} invoiceId={invoiceId} />
    </div>
  );
}