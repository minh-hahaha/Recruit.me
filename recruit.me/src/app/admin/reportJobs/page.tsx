"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

type JobRow = {
  id: string;
  title: string;
  status: string;
  isOpen: boolean;
  positions: number;
  applicantCount: number;
  hiredCount: number;
};

type CompanyReportRow = {
  id: string;
  name: string;
  offersCount: number;
  hiredCount: number;
  withdrawnCount: number;
  jobs: JobRow[];
};

type JobsReportResponse = {
  page: number;
  pageSize: number;
  totalCompanies: number;
  companies: CompanyReportRow[];
};

function JobsReportContent() {
  const params = useSearchParams();
  const router = useRouter();

  const pageParam = params.get("page");
  const [page, setPage] = useState<number>(pageParam ? parseInt(pageParam, 10) : 1);

  const [data, setData] = useState<JobsReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 4;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/report/jobs?page=${page}&pageSize=${pageSize}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(await res.text());
        const json: JobsReportResponse = await res.json();
        setData(json);
      } catch (e: any) {
        console.error("Failed to load jobs report:", e);
        setError(e?.message || "Failed to load jobs report");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCompanies / data.pageSize)) : 1;

  function goToPage(nextPage: number) {
    setPage(nextPage);
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(nextPage));
    router.push(`/admin/reportJobs?${params.toString()}`, { scroll: false });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading report...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Error</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
            {error || "Failed to load jobs report."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Jobs Report</h1>
          <div className="flex gap-2">
            <Link href="/admin/profile">
              <button className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
                Back to Admin Dashboard
              </button>
            </Link>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
          Lists all companies with job statistics and individual job postings.
        </p>

        {data.companies.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No companies found.
          </div>
        ) : (
          <div className="space-y-8">
            {data.companies.map((company) => (
              <div
                key={company.id}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">{company.name}</h2>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-300"># Offers: </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{company.offersCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-300"># Hired: </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{company.hiredCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-300"># Withdrawn: </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{company.withdrawnCount}</span>
                    </div>
                  </div>
                </div>

                {company.jobs.length === 0 ? (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">No jobs posted.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                          <th className="py-2 pr-4 text-zinc-900 dark:text-white">Job Title</th>
                          <th className="py-2 pr-4 text-zinc-900 dark:text-white">Status</th>
                          <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white"># Applicants</th>
                          <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white"># Hired</th>
                          <th className="py-2 pr-4 text-right text-zinc-900 dark:text-white">Positions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.jobs.map((job) => (
                          <tr
                            key={job.id}
                            className="border-b border-zinc-100 dark:border-zinc-800"
                          >
                            <td className="py-2 pr-4 text-zinc-900 dark:text-white">{job.title}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  job.isOpen
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {job.isOpen ? "Open" : "Closed"}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{job.applicantCount}</td>
                            <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{job.hiredCount}</td>
                            <td className="py-2 pr-4 text-right text-zinc-900 dark:text-white">{job.positions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">
            Page {data.page} of {totalPages} • {data.totalCompanies} companies
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

export default function JobsReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <JobsReportContent />
    </Suspense>
  );
}
