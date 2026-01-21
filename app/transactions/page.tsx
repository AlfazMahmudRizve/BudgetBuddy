import prisma from "@/lib/prisma";
import { TransactionManager } from "@/components/TransactionManager";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const transactions = await prisma.transaction.findMany({
        orderBy: {
            date: "desc",
        },
    });

    // Convert Date objects to strings for Client Component
    const formattedTransactions = transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
    }));

    return <TransactionManager initialTransactions={formattedTransactions} />;
}
