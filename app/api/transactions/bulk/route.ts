import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactions: transactionsData } = await request.json();

  if (!transactionsData) {
    return NextResponse.json(
      { error: "Transactions data is required." },
      { status: 400 }
    );
  }

  try {
    const parsedTransactions = transactionsData
      .split("\n")
      .map((line: string) => {
        const [name, purpose, amount] = line.split(",");
        return {
          userId: user.id,
          description: purpose,
          amount: parseFloat(amount),
          status: "pending",
          // Remove the date field
        };
      });

    await db.insert(transactions).values(parsedTransactions);

    return NextResponse.json({ message: "Transactions added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Failed to add transactions:", error);
    return NextResponse.json(
      { error: "Failed to add transactions." },
      { status: 500 }
    );
  }
}