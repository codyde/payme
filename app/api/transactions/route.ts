import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, invoices } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { eq } from "drizzle-orm";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  return NextResponse.json(userTransactions);
}

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description, amount, business, date, invoiceId } = await request.json();

  const [newTransaction] = await db.insert(transactions).values({
    userId: user.id,
    description,
    amount,
    business,
    date: new Date(date),
    invoiceId: invoiceId || null,
    status: "pending",
  }).returning();

  return NextResponse.json(newTransaction);
}

export async function DELETE(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactionId } = await request.json();

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  }

  const deletedTransaction = await db
    .delete(transactions)
    .where(eq(transactions.id, transactionId))
    .returning();

  if (deletedTransaction.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Transaction deleted successfully" });
}