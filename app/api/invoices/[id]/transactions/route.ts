import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = params.id;

  const invoiceTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.invoiceId, invoiceId));

  return NextResponse.json(invoiceTransactions);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactionIds } = await request.json();
  const invoiceId = params.id;

  await db.update(transactions)
    .set({ invoiceId })
    .where(eq(transactions.id, transactionIds));

  return NextResponse.json({ message: "Transactions added to invoice successfully" });
}