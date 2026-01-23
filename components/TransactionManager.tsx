"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Trash2, Receipt } from "lucide-react";
import { AddTransactionDialog } from "./AddTransactionDialog"; // Integrated directly
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useGuestTransactions } from "@/hooks/useGuestTransactions";
import { Transaction } from "@/lib/analytics";

interface TransactionManagerProps {
    initialTransactions?: Transaction[];
}

export function TransactionManager({ initialTransactions = [] }: TransactionManagerProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { transactions: guestTransactions, deleteTransaction } = useGuestTransactions();

    // Use initialTransactions for verified mode, or guestTransactions
    // Ideally we merge or select based on session. 
    // For this simple simplified version, let's trust the prop if passed, or fallback.
    const displayTransactions = session ? initialTransactions : guestTransactions;

    // Sort: Newest first
    const sortedTransactions = [...displayTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this record permanently?")) return;

        try {
            if (session) {
                await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
                router.refresh();
            } else {
                deleteTransaction(id);
                window.dispatchEvent(new Event("guest-transaction-updated"));
            }
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white font-mono">Financial Records</h2>
                    <p className="text-sm text-zinc-500 font-mono">Real-time ledger updates.</p>
                </div>
                {/* Add Transaction is now self-contained or we can place it here */}
                <AddTransactionDialog />
            </div>

            <div className="rounded-sm border border-zinc-800 bg-zinc-900/50 shadow-sm overflow-hidden font-mono">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#101010] border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs tracking-wider">Description</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs tracking-wider">Category</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs tracking-wider">Date</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {sortedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Receipt className="h-8 w-8 text-zinc-600" />
                                            <p className="font-bold">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="group hover:bg-zinc-800/50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-200">{transaction.description || "—"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-sm bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300 border border-zinc-700">
                                                {(transaction.category as any)?.name || transaction.category || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {format(new Date(transaction.date), "MMM d, yyyy")}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-bold text-base tracking-tight",
                                            transaction.type === 'income' ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {transaction.type === 'income' ? "+" : "-"}${Math.abs(Number(transaction.amount)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
