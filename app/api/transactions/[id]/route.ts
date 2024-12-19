import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transaction = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.id, parseInt(params.id, 10)),
        eq(transactions.userId, user.id)
      )
    )
    .limit(1);

  if (transaction.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(transaction[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedTransaction = await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, parseInt(params.id, 10)),
        eq(transactions.userId, user.id)
      )
    )
    .returning();

  if (deletedTransaction.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Transaction deleted successfully" });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updatedTransaction = await db
    .update(transactions)
    .set(body)
    .where(
      and(
        eq(transactions.id, parseInt(params.id, 10)),
        eq(transactions.userId, user.id)
      )
    )
    .returning();

  if (updatedTransaction.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(updatedTransaction[0]);
}