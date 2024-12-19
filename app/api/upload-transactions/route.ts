import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  console.log("user", user)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { processedTransactions } = await request.json();

  if (!processedTransactions || !Array.isArray(processedTransactions)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  const newTransactions = processedTransactions.map((transaction: any) => ({
    userId: user.id,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
  }));

  await db.insert(transactions).values(newTransactions);

  return NextResponse.json({ message: "Transactions uploaded successfully" });
}