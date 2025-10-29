"use client";

import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
    const [name, setName] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch("/components/api/loginApplicants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
            } else {
                setResult(`Welcome back, ${name}! (ID: ${data.id})`);
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
            <div className="login-card">
                <h1 className="login-title">Applicant Login</h1>

                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="name" className="login-label">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="login-input"
                            placeholder="Enter your name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? "loading" : ""}`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {result && <p className="login-success">{result}</p>}
                {error && <p className="login-error">{error}</p>}

                <div className="login-footer">
                    <Link href="/" className="login-back-link">
                        ← Back to Home
                    </Link>
                    <span className="mx-2 text-zinc-500">|</span>
                    <Link href="/components/applicant/register" className="login-register-link">
                        Register
                    </Link>
                </div>
            </div>
        </main>
    );
}