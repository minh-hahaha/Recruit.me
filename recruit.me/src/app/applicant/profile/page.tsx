"use client";

import { useEffect, useState, Suspense, cache } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {Applicant} from "@/app/api/entities";

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

type ProfileApplicationStatus = "Applied" | "Withdrawn" | "Interview" | "Offer" | "Rejected";

type ProfileApplication = {
  id: string;
  jobID: string;      
  title: string;
  company: string;
  location: string;
  salary?: string;
  status: ProfileApplicationStatus;
  appliedOn: string;
  withdrawnOn?: string | null;
};

type ApplicantWithApplications = Applicant & {
  applications?: ProfileApplication[];
};



type Offer = {
  id: string;
  title: string;
  company: string;
  amount: string;
  offeredOn: string;
  status: "Pending" | "Accepted" | "Rejected";
};

// ---- MOCK DATA ----

const MOCK_OFFERS: Offer[] = [
  {
    id: "o1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    amount: "$125,000",
    offeredOn: "10/01/2025",
    status: "Pending",
  },
];

function getInitials(fullName: string) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}


function ApplicantProfileContent() {
  const params = useSearchParams();
  const router = useRouter();
  const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");
  const [data, setData] = useState<Applicant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [applications,  setApplications] = useState<ProfileApplication[]>([]);
  const [withdrawingIds, setWithdrawingIds] = useState<Set<string>>(new Set());
  const [reapplyingIds, setReapplyingIds] = useState<Set<string>>(new Set());
  const [offers] = useState<Offer[]>(MOCK_OFFERS);


  useEffect(() => {
    console.log("Loading applicant data for ID:", aid);
    if (!aid) {
      setError("No applicant ID provided");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/applicant/${encodeURIComponent(aid)}`,
        { method: 'GET', cache: 'no-store' });
        if (!response.ok) throw new Error(await response.text());
        const a: ApplicantWithApplications = await response.json();
        
        if (!a) throw new Error("No applicant data found");

        setData(a);
        setName(a.name || "");
        setEmail(a.email || "");
        setLocation(a.location || "");
        setExperienceLevel(a.experienceLevel || "");
        setApplications(a.applications || []);
      } catch (e: any) {
        console.error("Failed to load applicant data:", e?.message || e);
        setError(e?.message || "Failed to load applicant data");
      } finally {
        setLoading(false);
      }
    })();
  }, [aid]
);  

  const totalApps = applications.length;
  const activeApps = applications.filter((a) =>
    ["Applied", "Interview", "Offer"].includes(a.status)
  ).length;
  const offersCount = offers.length;
  const skillCount = data?.skills.length ?? 0;

  const baseContainerClasses = "min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center";

  async function handleWithdraw(applicationId: string) {
  try {
    setWithdrawingIds(prev => {
      const next = new Set(prev);
      next.add(applicationId);
      return next;
    });

    const res = await fetch(
      `${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/withdrawApplication`,
      { method: "PUT" }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to withdraw application");
    }

    const data = await res.json();
    const updatedApp = data.application ?? data; 
  
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? {
              ...app,
              status: "Withdrawn",
              withdrawnOn: updatedApp?.withdrawnAt
                ? new Date(updatedApp.withdrawnAt).toLocaleDateString("en-US")
                : new Date().toLocaleDateString("en-US"),
            }
          : app
      )
    );
  } catch (err) {
    console.error("Withdraw failed:", err);
    alert("Could not withdraw from this job. Please try again.");
  } finally {
    setWithdrawingIds(prev => {
      const next = new Set(prev);
      next.delete(applicationId);
      return next;
    });
  }
}

async function handleReapply(app: ProfileApplication) {
  try {
    if (!aid) {
      alert("Missing applicant ID");
      return;
    }

    setReapplyingIds(prev => {
      const next = new Set(prev);
      next.add(app.id);
      return next;
    });

    const res = await fetch(`${API_BASE_URL}/applications/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantID: aid,
        jobID: app.jobID,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to re-apply");
    }

    const data = await res.json();
    const newApp = data.application ?? data;

    setApplications(prev =>
      prev.map(a =>
        a.id === app.id
          ? {
              ...a,
              status: "Applied",
              appliedOn:
                  newApp.appliedAt
                    ? new Date(newApp.appliedAt).toLocaleDateString("en-US")
                    : new Date().toLocaleDateString("en-US"),
              withdrawnOn: null,
            }
          : a
      )
    );
  } catch (err) {
    console.error("Re-apply failed:", err);
    alert("Could not re-apply to this job. Please try again.");
  } finally {
    setReapplyingIds(prev => {
      const next = new Set(prev);
      next.delete(app.id);
      return next;
    });
  }
}




  if (loading) {
    return (
      <div className={baseContainerClasses}>
        <div className="w-full max-w-7xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={baseContainerClasses}>
        <div className="w-full max-w-7xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
              {error || "Failed to load profile"}
            </h2>
            <button 
              onClick={() => router.push("/applicant/login")}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const firstName = data.name?.split(" ")[0] || "User";

  return (
    <div className={baseContainerClasses}>
      {/* ==== WELCOME HEADER ==== */}
      <div className="w-full flex flex-col md:flex-row justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8 text-left">
        <div className="h-14 w-14 rounded-full bg-white/20 mr-4" aria-hidden />
        <div>
          <h1 className="text-3xl font-semibold mb-1">Welcome back, {firstName}!</h1>
          <p className="text-white/80">
            {location || "—"} • {experienceLevel || "—"}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-white bg-transparent hover:bg-zinc-100/10">Search Jobs</button>
              <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={() => router.push(`/applicant/edit?aid=${encodeURIComponent(aid)}`)}>
                Edit Profile
              </button>
        </div>
      </div>

      {/* ==== METRICS BOXES ==== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl mb-8">
        <Metric label="Total Applications" value={totalApps} />
        <Metric label="Active Applications" value={activeApps} />
        <Metric label="Offers Received" value={offersCount} />
        <Metric label="Skills" value={skillCount} />
      </div>

      {/* ==== TWO COLUMN DASHBOARD ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 w-full max-w-7xl">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">
          {/* PROFILE OVERVIEW*/}
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
            <SectionHeader title="Profile Overview" />
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow" aria-hidden>
                <span className="text-xl font-semibold">{getInitials(name)}</span>
              </div>

              <div className="flex flex-col">
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">{name || "—"}</div>
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg
                    className="shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8l8 6 8-6v10H4Z"/>
                  </svg>
                  <span>{email || "—"}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-2">
              <div className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Skills</div>
              <div className="flex flex-wrap gap-2">
                {(data?.skills?.length ? data.skills : []).map((s) => (
                  <span key={s.name} className="inline-flex items-center rounded-full px-3 py-1 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100">{s.name}</span>
                ))}
                {!data?.skills?.length && <span className="text-sm text-zinc-600 dark:text-zinc-400">—</span>}
              </div>
            </div>
          </div>

          {/* RECENT APPLICATIONS */}
            <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col items-start gap-1 mb-4">
                <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Recent Applications</h2>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Track your job applications</span>
              </div>
              <div className="flex flex-col gap-4">
                {applications.map((a) => (
                <div key={a.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <strong className="text-zinc-900 dark:text-white">{a.title}</strong>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      a.status === "Applied" ? "border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-800" :
                      a.status === "Withdrawn" ? "border-zinc-300 text-zinc-700 dark:text-zinc-300 dark:border-zinc-700" :
                      a.status === "Interview" ? "border-amber-200 text-amber-700 dark:text-amber-300 dark:border-amber-800" :
                      a.status === "Offer" ? "border-amber-200 text-amber-700 dark:text-amber-300 dark:border-amber-800" :
                      "border-red-200 text-red-700 dark:text-red-300 dark:border-red-800"
                    }`}>{a.status}</span>
                </div>
                <div className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {a.company} • {a.location}
                  {a.salary ? ` • ${a.salary}` : ""}
                </div>
                <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">Applied {new Date(a.appliedOn).toLocaleDateString("en-US")}
                </div>
                {a.status === "Withdrawn" && a.withdrawnOn ? (
                  <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">Withdrawn {new Date(a.withdrawnOn).toLocaleDateString("en-US")}</div>
                ) : null}
                </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === "Applied" ? (
                      <button
                        onClick={() => handleWithdraw(a.id)}
                        disabled={withdrawingIds.has(a.id)}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {withdrawingIds.has(a.id) ? "Withdrawing..." : "Withdraw"}
                      </button>
                    ) : a.status === "Withdrawn" ? (
                      <button
                        onClick={() => handleReapply(a)}
                        disabled={reapplyingIds.has(a.id)}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed">
                        {reapplyingIds.has(a.id) ? "Re-applying..." : "Re-apply"}
                      </button>
                    ) : null} 
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>      
                    

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">
          {/* JOB OFFERS */}
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col items-start gap-1 mb-4">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Job Offers</h2>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Manage your job offers</span>
            </div>

            <div className="flex flex-col gap-4">
              {offers.map((o) => (
                <div key={o.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{o.title}</div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      o.status === "Pending" ? "border-amber-200 text-amber-700 dark:text-amber-300 dark:border-amber-800" :
                      o.status === "Accepted" ? "border-green-200 text-green-700 dark:text-green-300 dark:border-green-800" :
                      "border-red-200 text-red-700 dark:text-red-300 dark:border-red-800"
                    }`}>{o.status}</span>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{o.company}</div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">{o.amount || "—"}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Offered {o.offeredOn}</div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button 
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={o.status !== "Pending"}
                    >
                      Accept
                    </button>
                    <button 
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      disabled={o.status !== "Pending"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
            <SectionHeader title="Quick Actions" subtitle="Shortcuts & helpful links" />
            <div className="flex flex-col gap-3">
              <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full">Search New Jobs</button>
              <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full">Upload Resume</button>
              <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 w-full">View Saved Jobs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
      <ApplicantProfileContent />
    </Suspense>
  );
}

/* ---------- Presentational helpers ---------- */
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm text-center">
      <div className="text-3xl font-semibold text-black dark:text-zinc-50 mb-1">{value}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">{title}</h2>
      {subtitle ? <span className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</span> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span>{label}</span>
      {children}
    </label>
  );
}
