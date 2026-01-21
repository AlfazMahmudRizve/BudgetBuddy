"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardView } from "./DashboardView";
import { calculateDashboardMetrics, Transaction } from "@/lib/analytics";
import { useGuestTransactions } from "@/hooks/useGuestTransactions";
import Link from "next/link";

interface DashboardContainerProps {
    serverTransactions?: Transaction[]; // Passed from page.tsx if logged in
}

export function DashboardContainer({ serverTransactions = [] }: DashboardContainerProps) {
    const { data: session, status } = useSession();
    const { transactions: guestTransactions } = useGuestTransactions();

    // Decide which source to use
    // If loading, maybe show skeleton? For now, we wait.
    // If authenticated, use serverTransactions (which should be real-time if we use router.refresh() on add)
    // If unauthenticated, use guestTransactions.

    const isAuth = status === "authenticated";
    const transactions = isAuth ? serverTransactions : guestTransactions;

    const metrics = calculateDashboardMetrics(transactions);

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                <div>
                    {status === "loading" ? (
                        <span className="text-slate-400">Loading...</span>
                    ) : isAuth ? (
                        <span className="text-emerald-600 font-medium">Welcome back, {session.user?.name || "User"}!</span>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <span className="text-slate-500 text-sm">Guest Mode (Data saved in browser)</span>
                            <Link href="/login" className="text-emerald-600 text-sm hover:underline">Login to Sync</Link>
                        </div>
                    )}
                </div>
            </div>
            <DashboardView {...metrics} />
        </>
    );
}
