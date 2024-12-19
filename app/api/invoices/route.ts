import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { nanoid } from "nanoid";
import { eq, sum } from "drizzle-orm";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, billablePerson, email, dueDate } = await request.json();

  const [newInvoice] = await db.insert(invoices).values({
    id: nanoid(10),
    name,
    description,
    createdBy: user.id,
    billablePerson,
    status: 'unpaid',
  }).returning();

  return NextResponse.json(newInvoice);
}

export async function GET(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userInvoices = await db.select({
    id: invoices.id,
    name: invoices.name,
    description: invoices.description,
    billablePerson: invoices.billablePerson,
    status: invoices.status,
    createdAt: invoices.createdAt,
    totalAmount: sum(transactions.amount).as('totalAmount')
  })
  .from(invoices)
  .leftJoin(transactions, eq(invoices.id, transactions.invoiceId))
  .where(eq(invoices.createdBy, user.id))
  .groupBy(invoices.id);

  return NextResponse.json(userInvoices);
}