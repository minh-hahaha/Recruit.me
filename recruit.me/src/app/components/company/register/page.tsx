"use client";

import { useState } from "react";
import Link from "next/link";
import "./register.css";

export default function RegisterPage() {
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
            const res = await fetch("/api/registerCompanies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to register");
            } else {
                setResult(`Account created! ID: ${data.id}`);
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
            <div className="register-card">
                <h1 className="register-title">Register Company</h1>

                <form onSubmit={handleSubmit} className="register-form">
                    <div>
                        <label htmlFor="name" className="register-label">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="register-input"
                            placeholder="Enter your name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`register-button ${loading ? "loading" : ""}`}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                {result && <p className="register-success">{result}</p>}
                {error && <p className="register-error">{error}</p>}

                <div className="register-footer">
                    <Link href="/" className="register-back-link">
                        ← Back to Home
                    </Link>
                    <span className="mx-2 text-zinc-500">|</span>
                    <Link href="/components/company/login" className="register-login-link">
                        Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
