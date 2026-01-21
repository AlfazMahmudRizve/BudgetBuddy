"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [data, setData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Registration failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-center text-slate-900">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
