"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

function AdminProfileContent() {
  const params = useSearchParams();
  const router = useRouter();

  const adminId =
      params.get("aid") ||
      (typeof window !== "undefined" ? sessionStorage.getItem("adminId") || "" : "");

  const [adminData, setAdminData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Loading admin data for ID:", adminId);

    if (!adminId) {
      setError("No admin ID provided");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/${encodeURIComponent(adminId)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) throw new Error(await response.text());

        const json = await response.json();
        setAdminData(json);

      } catch (e: any) {
        console.error("Failed to load admin profile:", e?.message || e);
        setError(e?.message || "Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [adminId]);

  const baseContainerClasses =
      "min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center";

  if (loading) {
    return (
        <div className={baseContainerClasses}>
          <div className="w-full max-w-7xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 text-center border">
            Loading...
          </div>
        </div>
    );
  }

  if (error || !adminData) {
    return (
        <div className={baseContainerClasses}>
          <div className="w-full max-w-7xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
                {error || "Failed to load profile"}
              </h2>
              <button
                  onClick={() => router.push("/admin/login")}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
    );
  }

  const firstName = adminData.name?.split(" ")[0] || "Admin";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("adminId");
      router.push("/admin/login");
    }
  };

  return (
      <div className={baseContainerClasses}>
        {/* ==== WELCOME HEADER ==== */}
        <div className="w-full flex flex-col md:flex-row items-start bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8">
          <div className="h-14 w-14 rounded-full bg-white/20 mr-4" aria-hidden />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-1">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/80">
              Admin Dashboard
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <main className="flex-grow flex flex-col justify-center px-6 py-24 sm:px-16 sm:py-12">
          <div className="flex flex-col sm:flex-row gap-8 w-full max-w-4xl justify-center">
            {/* Report companies */}
            <div className="group flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center max-w-sm mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
                Report Companies
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                Prepares a report lists summarized information for all companies, including their name, # of jobs, # of applications, # hired.
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Link href="/admin/reportCompanies">
                  <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                    <p>Next &rarr;</p>
                  </button>
                </Link>
              </div>
            </div>

            {/* Report jobs for company */}
            <div className="group flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center max-w-sm mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50 text-center">
                Report Jobs For Company
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                Report jobs for a company lists all postings for that company, together with the number of applicants for each position and the number of positions hired
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Link href="/admin/reportJobs">
                  <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                    <p>Next &rarr;</p>
                  </button>
                </Link>
              </div>
            </div>

            {/* Report applicants  */}
            <div className="group flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center max-w-sm mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
                Report Applicants
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                Report applicants lists each applicant in the system, together with the # of jobs they have applied to, # of jobs they accepted, # of jobs they have withdrawn.
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Link href="/admin/reportApplicants">
                  <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                    <p>Next &rarr;</p>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

export default function AdminProfilePage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">
              Loading...
            </div>
          }
      >
        <AdminProfileContent />
      </Suspense>
  );
}
