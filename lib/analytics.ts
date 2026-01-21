
export interface Transaction {
    id: string;
    amount: number;
    type: string;
    category: string;
    description: string;
    date: Date | string; // Date from DB, string from JSON/LocalStorage
    createdAt?: Date | string;
}

export function calculateDashboardMetrics(transactions: Transaction[]) {
    // Normalize dates
    const normalizedTransactions = transactions.map(t => ({
        ...t,
        dateValue: new Date(t.date),
    }));

    const totalIncome = normalizedTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = normalizedTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    // Group expenses by category
    const expenseByCategoryMap = normalizedTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const expenseByCategory = Object.entries(expenseByCategoryMap).map(([name, value]) => ({
        name,
        value,
    }));

    // Group income by category
    const incomeByCategoryMap = normalizedTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const incomeByCategory = Object.entries(incomeByCategoryMap).map(([name, value]) => ({
        name,
        value,
    }));

    // Monthly Activity (Last 6 months)
    const monthlyDataMap = new Map<string, { income: number; expense: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
    }

    normalizedTransactions.forEach((t) => {
        const monthKey = t.dateValue.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap.has(monthKey)) {
            const current = monthlyDataMap.get(monthKey)!;
            if (t.type === 'income') current.income += t.amount;
            else current.expense += t.amount;
        }
    });

    const monthlyData = Array.from(monthlyDataMap.entries()).map(([name, data]) => ({
        name,
        ...data
    }));

    // Trend Data (Running Balance)
    let currentBalance = 0;
    const sortedTransactions = [...normalizedTransactions].sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime());

    const dailyBalanceMap = new Map<string, number>();

    sortedTransactions.forEach((t) => {
        if (t.type === 'income') currentBalance += t.amount;
        else currentBalance -= t.amount;

        const dateKey = t.dateValue.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        dailyBalanceMap.set(dateKey, currentBalance);
    });

    const trendData = Array.from(dailyBalanceMap.entries())
        .map(([date, balance]) => ({ date, balance }))
        .slice(-15);

    return {
        totalBalance,
        totalIncome,
        totalExpense,
        expenseByCategory,
        incomeByCategory,
        monthlyData,
        trendData,
    };
}
