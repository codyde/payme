import { Resend } from 'resend';
import * as React from 'react';
import EmailTemplate from '@/components/EmailTemplate';
import { db } from '@/db';
import { invoices, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { invoiceId } = await request.json();
    // call the invoices database and get the details for an invoice 
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    // get invoices from transactions that match the invoiceId
    console.log(invoice);
    const invoiceTransactions = await db.select().from(transactions).where(eq(transactions.invoiceId, invoiceId));

    // Calculate the total amount
    const totalAmount = invoiceTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Cody <cody@buildwithcode.io>',
      to: [invoice.billablePerson],
      subject: "Total Owed: $" + totalAmount.toFixed(2),
      react: EmailTemplate({ invoice: {
        ...invoice,
        person: invoice.billablePerson,
        total: totalAmount,
        transactions: invoiceTransactions.map(t => ({ ...t, amount: Number(t.amount) })),
        email: invoice.billablePerson
      } }) as React.ReactElement,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}