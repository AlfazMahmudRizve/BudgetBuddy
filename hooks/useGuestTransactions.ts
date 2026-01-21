
import { useState, useEffect } from "react";
import { Transaction } from "@/lib/analytics";

const STORAGE_KEY = "budget_buddy_guest_transactions";

export function useGuestTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const loadTransactions = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setTransactions(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse guest transactions", e);
                }
            }
        };

        loadTransactions();

        const handleStorageChange = () => loadTransactions();
        // Custom event for same-tab updates
        window.addEventListener("guest-transaction-updated", handleStorageChange);
        // Storage event for cross-tab updates
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("guest-transaction-updated", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const addTransaction = (transaction: Omit<Transaction, "id">) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newTransaction;
    };

    const deleteTransaction = (id: string) => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    return { transactions, addTransaction, deleteTransaction };
}
