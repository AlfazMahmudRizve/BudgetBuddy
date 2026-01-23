import prisma from "@/lib/prisma";
import { DashboardContainer } from "@/components/DashboardContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Transaction } from "@/lib/analytics";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  let transactions: Transaction[] = [];

  const userId = session?.user ? (session.user as any).id : undefined;

  if (userId && typeof userId === 'string') {
    try {
      const dbTransactions = await prisma.transaction.findMany({
        where: {
          userId: userId,
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
    } catch (e) {
      console.error("Failed to fetch transactions", e);
      // Fallback or empty transactions
    }
  }



  return (
    <DashboardContainer serverTransactions={transactions} />
  );
}
