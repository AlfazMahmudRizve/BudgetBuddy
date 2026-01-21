import prisma from "@/lib/prisma";
import { DashboardContainer } from "@/components/DashboardContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Transaction } from "@/lib/analytics";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  let transactions: Transaction[] = [];

  if (session && session.user && (session.user as any).id) {
    const dbTransactions = await prisma.transaction.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Convert to compatible type (Date to string/Date)
    transactions = dbTransactions.map(t => ({
      ...t,
      category: t.category, // Type assertion might be needed if mismatched
      // Convert Prisma dates to Date objects (already are, but interface matches)
    }));
  }

  return (
    <DashboardContainer serverTransactions={transactions} />
  );
}
