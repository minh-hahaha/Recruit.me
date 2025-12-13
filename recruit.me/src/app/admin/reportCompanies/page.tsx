"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {Company, Job} from "@/app/api/entities";

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';
export default function ReportCompaniesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">
                Loading...
            </div>
        }>
            <ReportCompanies />
        </Suspense>
    );
}

function ReportCompanies() {
    const router = useRouter();
    const params = useSearchParams();
    const pageParam = parseInt(params.get("page") || "1", 10);
    const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("adminId") || "" : "");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [page, setPage] = useState(pageParam);
    const pageSize = 10;

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/report/companies?page=${page}&pageSize=${pageSize}`,
                { method: "GET", cache: "no-store" }
            );

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            setCompanies(data.companies || []);
            setTotalCompanies(data.totalCompanies || 0);
        } catch (err) {
            console.error(err);
            setError("Failed to load companies report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [page]);

    const nextPage = () => {
        if (page * pageSize < totalCompanies) {
            router.push(`/admin/reportCompanies?page=${page + 1}`);
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            router.push(`/admin/reportCompanies?page=${page - 1}`);
            setPage(page - 1);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center">

            {/* Error */}
            {error && (
                <div className="text-red-600 dark:text-red-400 mt-3">
                    {error}
                </div>
            )}

            {/* Page Header */}
            <div className="w-full flex flex-col md:flex-row justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8 text-left">
                <div className="px-4">
                    <h1 className="text-3xl font-semibold mb-1">Company Reports</h1>
                    <p className="text-white/80">Admin dashboard overview</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-white bg-transparent hover:bg-zinc-100/10"
                        onClick={() => router.push(`/admin/profile?aid=${encodeURIComponent(aid)}`)}
                    >
                        Back to Admin Dashboard
                    </button>
                </div>
            </div>

            {/* Companies list */}
            <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">

                <div className="flex flex-col items-start gap-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                        Companies
                    </h2>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Total companies: {totalCompanies}
                    </span>
                </div>

                {/* Table */}
                <div className="mt-4 w-full max-w-6xl mx-auto border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                    <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm px-6 py-4">
                        <div className="flex-1">Company</div>
                        <div className="flex-1 text-center">Jobs Count</div>
                        <div className="flex-1 text-center">Total Applicants</div>
                        <div className="flex-1 text-center">Total Hired</div>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        companies.map((c) => (
                            <div
                                key={c.id}
                                className="flex flex-col md:flex-row items-start md:items-center border-t border-zinc-200 dark:border-zinc-700 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                            >
                                <div className="flex-1 text-sm md:text-base text-zinc-700 dark:text-zinc-200">
                                    {c.name}
                                </div>

                                <div className="flex-1 text-center text-zinc-700 dark:text-zinc-300">
                                    {c.jobsCount}
                                </div>

                                <div className="flex-1 text-center text-zinc-700 dark:text-zinc-300">
                                    {c.totalApplicants}
                                </div>

                                <div className="flex-1 text-center text-zinc-700 dark:text-zinc-300">
                                    {c.totalHired}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={prevPage}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-zinc-700 dark:text-zinc-300 px-4">
                        Page {page}
                    </span>

                    <button
                        onClick={nextPage}
                        disabled={page * pageSize >= totalCompanies}
                        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}