import prisma from "@/lib/prisma";
import { TransactionManager } from "@/components/TransactionManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    let transactions: any[] = [];

    if (session && session.user) {
        transactions = await prisma.transaction.findMany({
            where: {
                userId: (session.user as any).id,
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    // Convert Date objects to strings for Client Component
    const formattedTransactions = transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
    }));

    return <TransactionManager initialTransactions={formattedTransactions} />;
}
