import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { ExpensePieChart } from "./ExpensePieChart";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { MonthlyBarChart } from "./MonthlyBarChart";
import { TrendAreaChart } from "./TrendAreaChart";

interface DashboardViewProps {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    expenseByCategory: { name: string; value: number }[];
    monthlyData: { name: string; income: number; expense: number }[];
    trendData: { date: string; balance: number }[];
}

export function DashboardView({
    totalBalance,
    totalIncome,
    totalExpense,
    expenseByCategory,
    monthlyData,
    trendData,
}: DashboardViewProps) {
    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your personal finances</p>
                </div>
                <AddTransactionDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Balance"
                    value={`$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Total Income"
                    value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Total Expenses"
                    value={`$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={TrendingDown}
                    color="red"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-4 space-y-6">
                    <TrendAreaChart data={trendData} />
                    <MonthlyBarChart data={monthlyData} />
                </div>
                <div className="col-span-3 lg:col-span-3">
                    <ExpensePieChart data={expenseByCategory} />
                </div>
            </div>
        </div>
    );
}
