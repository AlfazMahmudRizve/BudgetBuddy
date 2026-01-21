"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r bg-slate-900 text-white transition-transform sm:translate-x-0">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-5 flex items-center pl-2.5">
                    <div className="mr-3 p-1 bg-emerald-500 rounded-lg">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                        BudgetBuddy
                    </span>
                </div>
                <ul className="space-y-2 font-medium">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "flex items-center rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white group",
                                        isActive && "bg-slate-800 text-emerald-400"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 flex-shrink-0 transition duration-75 text-slate-400 group-hover:text-white", isActive && "text-emerald-400")} />
                                    <span className="ml-3">{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
