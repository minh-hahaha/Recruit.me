"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
            <SearchJobs />
        </Suspense>
    );
}

function SearchJobs() {
    const params = useSearchParams();
    const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!aid) {
            setError("No applicant ID provided");
            setLoading(false);
            return;
        }
        (async () => {
            setLoading(true);
            try {

            } catch (e: any) {
                console.error("Failed to load profile:", e?.message || e);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
    }, [aid]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center">
                <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center">
            {/* Header */}
            <div className="w-full flex flex-col md:flex-row justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8 text-left">
                <div className="px-4">
                    <h1 className="text-3xl font-semibold mb-1">Search Jobs</h1>
                    <p className="text-white/80">Find your next opportunity</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-white bg-transparent hover:bg-zinc-100/10"
                        onClick={() => router.push(`/applicant/profile?aid=${encodeURIComponent(aid)}`)}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col items-start gap-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Search & Filter</h2>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Use filters to find jobs that match your skills and preferences
                    </span>
                    <div className="flex items-center gap-3 mt-4 md-0">
                        <div className="width:25%">
                            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Search</span>
                            <input
                                className=" border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>
                        <div className="width:25%">
                            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Skill</span>
                            <input
                                className=" border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>
                        <div className="width:25%">
                            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Company</span>
                            <input
                                className=" border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>
                        <div className="width:25%">
                            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Actions</span>
                            <button
                                className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-white bg-transparent hover:bg-zinc-100/10">
                                Clear Filters
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col items-start gap-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Job Results</h2>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Showing 4 jobs * Page 1 of 1
                    </span>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto flex justify-center items-center p-8 bg-transparent">
                <span className="flex items-center gap-6 text-2xl font-semibold text-black dark:text-zinc-50">
                    <button className="hover:scale-110 transition">&lt;</button>
                    <button className="hover:scale-110 transition">1</button>
                    <button className="hover:scale-110 transition">&gt;</button>
                </span>
            </div>
        </div>
    );
}