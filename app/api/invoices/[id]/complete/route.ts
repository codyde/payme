import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = params.id;

  // Update invoice status
  await db.update(invoices)
    .set({ status: 'paid' })
    .where(eq(invoices.id, invoiceId));

  // Update all associated transactions to 'paid' status
  await db.update(transactions)
    .set({ status: 'paid' })
    .where(eq(transactions.invoiceId, invoiceId));

  return NextResponse.json({ message: "Invoice marked as paid and transactions updated" });
}