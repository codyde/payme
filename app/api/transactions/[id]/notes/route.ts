import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateRequest } from "@/lib/auth/lucia";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const { user } = await validateRequest();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { notes } = await req.json();
    const transactionId = parseInt(params.id);

    if (isNaN(transactionId)) {
        return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), { status: 400 });
    }

    try {
        await db.update(transactions)
            .set({ notes })
            .where(eq(transactions.id, transactionId));

        return new Response(JSON.stringify({ message: 'Notes updated successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error updating notes:', error);
        return new Response(JSON.stringify({ error: 'Failed to update notes' }), { status: 500 });
    }
}