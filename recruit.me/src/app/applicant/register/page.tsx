"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch("https://8f542md451.execute-api.us-east-1.amazonaws.com/prod/applicant/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password}),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to register");
            } else {
                sessionStorage.setItem("applicantId", data.id);
                router.push(`/applicant/login`);
                setName("");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex w-full max-w-3xl flex-col items-center justify-center px-6 py-24 sm:px-16 sm:py-32">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
                <h1 className="text-3xl font-semibold mb-6 text-black dark:text-zinc-50 text-center">Register Applicant</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="Enter your name"
                        />
                        <label htmlFor="name" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200 mt-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-600"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-lg font-medium text-white transition ${
                            loading 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                {result && <p className="mt-6 text-green-600 dark:text-green-400 text-center">{result}</p>}
                {error && <p className="mt-6 text-red-600 dark:text-red-400 text-center">{error}</p>}

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-zinc-700 dark:text-zinc-300 hover:underline">
                        ← Back to Home
                    </Link>
                    <span className="mx-2 text-zinc-500">|</span>
                    <Link href="/applicant/login" className="text-sm text-zinc-700 dark:text-zinc-300 hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </main>
    );
}