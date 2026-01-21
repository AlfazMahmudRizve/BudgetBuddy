import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color?: "default" | "green" | "red";
}

export function StatCard({ title, value, icon: Icon, color = "default" }: StatCardProps) {
    const colorStyles = {
        default: "text-slate-900",
        green: "text-emerald-500",
        red: "text-red-500",
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-500">{title}</h3>
                <div className={cn("p-2 rounded-full bg-slate-50", color === 'green' && "bg-emerald-50", color === 'red' && "bg-red-50")}>
                    <Icon className={cn("h-4 w-4", colorStyles[color])} />
                </div>
            </div>
            <div className={cn("text-2xl font-bold mt-2", colorStyles[color])}>{value}</div>
        </div>
    );
}
