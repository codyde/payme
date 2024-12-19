import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";

import { invoices, transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = params.id;

  // Start a transaction to ensure both operations succeed or fail together
  await db.transaction(async (tx) => {
    // Delete associated transactions first
    await tx.delete(transactions).where(eq(transactions.invoiceId, invoiceId));

    // Then delete the invoice
    await tx.delete(invoices).where(eq(invoices.id, invoiceId));
  });

  return NextResponse.json({ message: "Invoice and associated transactions deleted" });
}

