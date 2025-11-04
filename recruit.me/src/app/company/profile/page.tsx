"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type {Company} from "@/app/api/entities";
import {Job} from "@/app/api/entities";

const API_BASE_URL = 'https://f91m7y39wl.execute-api.us-east-1.amazonaws.com/prod';


export default function CompanyProfilePage() {
  const params = useSearchParams();
  const router = useRouter();
  const cid = params.get("cid") || (typeof window !== "undefined" ? sessionStorage.getItem("companyId") || "" : "");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!cid) {
      setError("No company id provided");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const companyRes = await fetch(`${API_BASE_URL}/api/profileCompanies/${encodeURIComponent(cid)}`, { method: 'GET', cache: "no-store" });
        const companyText = await companyRes.text();
        let companyBody: any;
        try { companyBody = companyText ? JSON.parse(companyText) : {}; } catch { companyBody = { raw: companyText }; }
        if (!companyRes.ok) throw new Error(companyBody?.error || companyBody?.raw || `API error ${companyRes.status}`);
        setCompany(companyBody as Company);

        try {
          const jobsRes = await fetch(`${API_BASE_URL}/job/getJob`, { method: 'GET', cache: "no-store" });
          if (!jobsRes.ok) {
            console.warn("jobs endpoint returned", jobsRes.status);
            setJobs([]);
          } else {
            const allJobs = await jobsRes.json();
            const companyJobs = Array.isArray(allJobs) ? allJobs.filter((j: any) => String(j.companyID) === String(cid)) : [];
            setJobs(companyJobs);
          }
        } catch (jobErr) {
          console.error("Failed to fetch jobs:", jobErr);
          setJobs([]);
        }
      } catch (e: any) {
        console.error("Failed to load company:", e);
        setError(e?.message || "Failed to load company");
      } finally {
        setLoading(false);
      }
    })();
  }, [cid]);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const applicantCount = jobs.reduce((acc, j) => acc + j.applicantCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800 text-center">
          Loading company...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{error}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.refresh()} className="px-4 py-2 border rounded">Retry</button>
            <Link href="/"><button className="px-4 py-2 border rounded">Home</button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800 text-center">
          Company not found
        </div>
      </div>
    );
  }

  const firstWord = company.name?.split(" ")[0] ?? "Company";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">{company.name}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{company.industry || "—"} • {company.location || "—"}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/company/edit?cid=${company.id}`}>
              <button className="inline-flex items-center px-4 py-2 rounded-lg border bg-transparent">Edit Profile</button>
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Metric label="Jobs Posted" value={totalJobs} />
          <Metric label="Active Jobs" value={activeJobs} />
          <Metric label="Applicants" value={applicantCount} />
          <Metric label="Company Age" value={company.createdAt ? Math.max(0, Math.floor((Date.now() - new Date(company.createdAt).getTime()) / (1000*60*60*24))) + " days" : "—"} />
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Overview + Jobs */}
          <div className="space-y-6">
            <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 border border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-semibold mb-3">About {firstWord}</h2>
              <p className="text-zinc-700 dark:text-zinc-300">{company.description || <em>No description provided.</em>}</p>
              {company.website && (
                <p className="mt-3 text-sm">
                  Website: <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600">{company.website}</a>
                </p>
              )}
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Jobs</h3>
                <Link href="/company/job"><span className="text-sm text-zinc-600">Manage all</span></Link>
              </div>
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-zinc-600">{j.createdAt.toString()} • {j.applicantCount} applicants</div>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${j.status === "Active" ? "bg-green-100 text-green-800" : j.status === "Draft" ? "bg-zinc-100 text-zinc-800" : "bg-red-100 text-red-800"}`}>
                        {j.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Quick Actions */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 border border-zinc-100 dark:border-zinc-800">
              <h4 className="text-lg font-semibold mb-2">Actions</h4>
              <div className="flex flex-col gap-3">
                <Link href="/company/job/create"><button className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white">Create Job</button></Link>
                <Link href="/company/job"><button className="w-full px-3 py-2 rounded-lg border">Manage Jobs</button></Link>
                <Link href={`/company/edit?cid=${company.id}`}><button className="w-full px-3 py-2 rounded-lg border">Edit Profile</button></Link>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 border border-zinc-100 dark:border-zinc-800">
              <h4 className="text-lg font-semibold mb-2">Contact</h4>
              <p className="text-sm text-zinc-600">{company.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : "No contact info"}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ---------- Presentational helpers ---------- */
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
      <div className="text-2xl font-semibold mb-1 text-black dark:text-zinc-50">{value}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
    </div>
  );
}