import { db } from "@/db";
import { transactions, } from "@/db/schema";

interface User {
    id: string;
    githubId: string;
    username: string;
}

export async function processTransactions(user: User, processedTransactions: any[]) {

const newTransactions = processedTransactions.map((transaction: any) => ({
    userId: user.id,
    date: new Date(transaction.date),
    description: transaction.description,
    amount: transaction.amount,
  }));

  await db.insert(transactions).values(newTransactions);

  return newTransactions;
}