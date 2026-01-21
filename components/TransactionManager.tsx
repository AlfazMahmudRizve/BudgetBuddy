"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useGuestTransactions } from "@/hooks/useGuestTransactions";

interface Transaction {
    id: string;
    amount: number;
    type: string;
    category: string;
    date: string;
}

interface TransactionManagerProps {
    initialTransactions: Transaction[];
}

export function TransactionManager({ initialTransactions }: TransactionManagerProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { transactions: guestTransactions, addTransaction, deleteTransaction } = useGuestTransactions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
    });

    // Use server transactions if logged in, otherwise guest transactions
    const transactions = session ? initialTransactions : guestTransactions;

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        if (session) {
            await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            router.refresh();
        } else {
            deleteTransaction(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (session) {
                await fetch("/api/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                router.refresh();
            } else {
                addTransaction({
                    amount: Number(formData.amount),
                    type: formData.type,
                    category: formData.category,
                    description: "", // Simple Manager doesn't have description field in form yet, or we ignored it
                    date: formData.date
                } as any);
                // Trigger global update
                window.dispatchEvent(new Event("guest-transaction-updated"));
            }

            setIsModalOpen(false);
            setFormData({
                amount: "",
                type: "expense",
                category: "",
                date: new Date().toISOString().split("T")[0],
            });
        } catch (error) {
            console.error("Failed to add transaction", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-slate-900 text-white hover:bg-slate-900/90 h-10 py-2 px-4"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="w-full text-left text-sm text-slate-500">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                    No transactions found. Add one to get started.
                                </td>
                            </tr>
                        ) : transactions.map((t) => (
                            <tr key={t.id} className="border-b bg-white hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{t.category}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={cn(
                                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            t.type === "income"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-red-100 text-red-800"
                                        )}
                                    >
                                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                <td className={cn("px-6 py-4 font-semibold", t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="font-medium text-red-600 hover:underline"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900">Type</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input type="radio" value="expense" checked={formData.type === 'expense'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span>Expense</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="radio" value="income" checked={formData.type === 'income'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span>Income</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900">Amount</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900">Category</label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g. Food, Salary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="mr-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-blue-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Add Transaction"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
