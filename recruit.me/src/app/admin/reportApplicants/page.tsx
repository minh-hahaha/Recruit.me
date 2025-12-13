"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

/* ---------------- Types ---------------- */

type ApplicantReportRow = {
  id: string;
  name: string;
  email: string;
  jobsApplied: number;
  jobsAccepted: number;
  jobsWithdrawn: number;
};

type ApplicantsReportResponse = {
  page: number;
  pageSize: number;
  totalApplicants: number;
  applicants: ApplicantReportRow[];
};



function ApplicantsReportContent() {
  const params = useSearchParams();
  const router = useRouter();

  const pageParam = params.get("page");
  const [page, setPage] = useState<number>(pageParam ? parseInt(pageParam, 10) : 1);

  const [data, setData] = useState<ApplicantsReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/report/applicants?page=${page}&pageSize=${pageSize}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(await res.text());

        const json: ApplicantsReportResponse = await res.json();

        setData(json);
      } catch (e: any) {
        console.error("Failed to load applicants report:", e);
        setError(e?.message || "Failed to load applicants report");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.totalApplicants / data.pageSize));
  }, [data]);

  function goToPage(nextPage: number) {
    setPage(nextPage);
    const usp = new URLSearchParams(window.location.search);
    usp.set("page", String(nextPage));
    router.push(`/admin/reportApplicants?${usp.toString()}`, { scroll: false });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
            Error
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
            {error || "Failed to load applicants report."}
          </p>
          <Link href="/admin/profile">
            <button className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
              Back to Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Applicants Report
          </h1>
          <div className="flex gap-2">
            <Link href="/admin/profile">
              <button className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
                Back to Admin Dashboard
              </button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
          Lists all applicants with counts of applied, accepted, and withdrawn applications.
        </p>

        {(data.applicants ?? []).length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No applicants found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                  <th className="py-2 pr-4 text-zinc-900 dark:text-white">Name</th>
                  <th className="py-2 pr-4 text-zinc-900 dark:text-white">Email</th>
                  <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white"># Applied</th>
                  <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white"># Accepted</th>
                  <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white"># Withdrawn</th>
                </tr>
              </thead>
              <tbody>
                {data.applicants.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-900 dark:text-white">{a.name}</td>
                    <td className="py-2 pr-4 text-zinc-900 dark:text-white">{a.email}</td>
                    <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{a.jobsApplied}</td>
                    <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{a.jobsAccepted}</td>
                    <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{a.jobsWithdrawn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">
            Page {data.page} of {totalPages} • {data.totalApplicants} applicants
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantsReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <ApplicantsReportContent />
    </Suspense>
  );
}
