"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

type ApplicantReportRow = {
  id: string;
  name: string;
  email: string;
  jobsApplied: number;
  jobsAccepted: number;
  jobsWithdrawn: number;
};

type ApplicantReportResponse = {
  page: number;
  pageSize: number;
  totalApplicants: number;
  applicants: ApplicantReportRow[];
};

function ApplicantReportContent() {
  const params = useSearchParams();
  const router = useRouter();

  const pageParam = params.get("page");
  const [page, setPage] = useState<number>(pageParam ? parseInt(pageParam, 10) : 1);

  const [data, setData] = useState<ApplicantReportResponse | null>(null);
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
        const json: ApplicantReportResponse = await res.json();
        setData(json);
      } catch (e: any) {
        console.error("Failed to load applicant report:", e);
        setError(e?.message || "Failed to load applicant report");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize]);

  const totalPages = data ? Math.max(1, Math.ceil(data.totalApplicants / data.pageSize)) : 1;

  function goToPage(nextPage: number) {
    setPage(nextPage);
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(nextPage));
    router.push(`/admin/reportApplicants?${params.toString()}`, { scroll: false });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading report...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
            {error || "Failed to load applicant report."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Applicant Report</h1>
          <div className="flex gap-2">
            <Link href="/admin/reportJobs">
              <button className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
                View Jobs Report
              </button>
            </Link>
            <Link href="/admin/profile">
              <button className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
                Back to Profile
              </button>
            </Link>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Lists all applicants with counts of jobs applied to, accepted, and withdrawn.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4 text-right"># Applied</th>
                <th className="py-2 pr-4 text-right"># Accepted</th>
                <th className="py-2 pr-4 text-right"># Withdrawn</th>
              </tr>
            </thead>
            <tbody>
              {data.applicants.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4">{a.name}</td>
                  <td className="py-2 pr-4">{a.email}</td>
                  <td className="py-2 pr-4 text-right">{a.jobsApplied}</td>
                  <td className="py-2 pr-4 text-right">{a.jobsAccepted}</td>
                  <td className="py-2 pr-4 text-right">{a.jobsWithdrawn}</td>
                </tr>
              ))}
              {data.applicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-zinc-500">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
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

export default function ApplicantReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ApplicantReportContent />
    </Suspense>
  );
}
