"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Applicant,
  Application as AppEntity,
  ApplicationStatus,
  ApplicationRating,
} from "@/app/api/entities";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

type FrontendApplication = AppEntity & { applicant?: Applicant };

export default function JobApplicantsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const jid = params.get("jid") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<FrontendApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"New" | "Hireable" | "Wait" | "Unacceptable">("New");

  // pagination state per tab (pageSize = 1)
  const [indexByTab, setIndexByTab] = useState<Record<string, number>>({
    New: 0,
    Hireable: 0,
    Wait: 0,
    Unacceptable: 0,
  });

  useEffect(() => {
    if (!jid) {
      setError("No job id provided");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/job/getApplicants?jobId=${encodeURIComponent(jid)}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `API error ${res.status}`);
        }
        const body = await res.json();

        const mapped: FrontendApplication[] = Array.isArray(body)
          ? body.map((r: any) => {
              const inst = new AppEntity(r.applicantID, r.jobID, r.companyID);
              inst.id = r.id;
              inst.status = (r.applicationStatus || r.status) ? String(r.applicationStatus || r.status) as ApplicationStatus : ApplicationStatus.Applied;
              // rating kept as DB value (null -> undefined)
              inst.rating = r.rating ? (String(r.rating) as ApplicationRating) : undefined;
              inst.offerStatus = r.offerStatus ?? inst.offerStatus;
              if (r.appliedAt) inst.appliedAt = new Date(r.appliedAt);
              if (r.withdrawnAt) inst.withdrawnAt = new Date(r.withdrawnAt);
              inst.createdAt = r.createdAt ? new Date(r.createdAt) : inst.createdAt;
              inst.updatedAt = r.updatedAt ? new Date(r.updatedAt) : inst.updatedAt;

              const instAny = inst as FrontendApplication;
              instAny.applicant = r.applicant;
              return instAny;
            })
          : [];

        setApplications(mapped);
      } catch (e: any) {
        console.error("Failed to load applications", e);
        setError(e?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    })();
  }, [jid]);

  async function UpdateRating(appId: string, newStatus: string) {
    try {
      const ratingPayload: ApplicationRating | null =
        newStatus === "Hireable" ? ApplicationRating.Hirable
          : newStatus === "Wait" ? ApplicationRating.Waitlist
          : newStatus === "Unacceptable" ? ApplicationRating.Unacceptable
          : null;

      const res = await fetch(`${API_BASE_URL}/applicants/updateRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, rating: ratingPayload }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `status update failed ${res.status}`);
      }

      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== appId) return a;
          const copy = { ...a } as FrontendApplication;
          copy.rating = ratingPayload ?? undefined;
          return copy;
        })
      );
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status: " + (e as any)?.message);
    }
  }

  async function offerJob(appId: string) {
    try {
      // optimistic local update
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, offerStatus: "Pending" } : a))
      );

      // const res = await fetch(`${API_BASE_URL}/job/offerApplicant?applicationId=${encodeURIComponent(appId)}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({}),
      // });
      const res = await fetch(`${API_BASE_URL}/applications/offerApplicant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `offer failed ${res.status}`);
      }

      // if backend returns updated object you can merge it here; otherwise keep optimistic
    } catch (e) {
      console.error("Failed to offer job", e);
      alert("Failed to offer job: " + (e as any)?.message);
      // revert optimistic change on failure
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, offerStatus: undefined } : a))
      );
    }
  }

  // helper: map DB fields -> UI category (rating null/undefined => New only if status == Applied)
  function getCategory(a: FrontendApplication): "New" | "Hireable" | "Wait" | "Unacceptable" {
    if ((a.rating === null || a.rating === undefined) && a.status === ApplicationStatus.Applied) return "New";
    if (a.rating === ApplicationRating.Hirable) return "Hireable";
    if (a.rating === ApplicationRating.Waitlist || a.rating === ApplicationRating.Wait) return "Wait";
    if (a.rating === ApplicationRating.Unacceptable) return "Unacceptable";
    return "New";
  }

  const grouped = useMemo(() => ({
    New: applications.filter((a) => getCategory(a) === "New"),
    Hireable: applications.filter((a) => getCategory(a) === "Hireable"),
    Wait: applications.filter((a) => getCategory(a) === "Wait"),
    Unacceptable: applications.filter((a) => getCategory(a) === "Unacceptable"),
  }), [applications]);

  // helpers for paginating one profile at a time
  function currentIndexFor(tab: string) {
    return indexByTab[tab] ?? 0;
  }
  function setIndexFor(tab: string, idx: number) {
    setIndexByTab((prev) => ({ ...prev, [tab]: Math.max(0, Math.min(idx, Math.max(0, (grouped as any)[tab].length - 1))) }));
  }
  function next() {
    setIndexFor(activeTab, currentIndexFor(activeTab) + 1);
  }
  function prev() {
    setIndexFor(activeTab, currentIndexFor(activeTab) - 1);
  }

  if (loading) return <div className="p-8 text-white">Loading applicants...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  const currentList = (grouped as any)[activeTab] as FrontendApplication[];
  const currentIndex = currentIndexFor(activeTab);
  const currentApp = currentList && currentList.length > 0 ? currentList[currentIndex] : null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 text-white">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">Applicants for Job</h1>
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="px-3 py-2 border border-zinc-700 rounded text-white">Back</button>
            <Link href="/"><button className="px-3 py-2 border border-zinc-700 rounded text-white">Logout</button></Link>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {(["New", "Hireable", "Wait", "Unacceptable"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-2 rounded ${activeTab === t ? "bg-blue-600 text-white" : "bg-zinc-800 border border-zinc-700 text-white"}`}
            >
              {t} ({(grouped as any)[t].length})
            </button>
          ))}
        </div>

        {/* Single large profile card */}
        <div className="space-y-4">
          { !currentApp && <div className="p-6 bg-zinc-900 rounded border border-zinc-800 text-white">No applicants in this category.</div> }

          { currentApp && (
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-semibold text-white">
                  { (currentApp.applicant?.name && currentApp.applicant.name.split(' ').map(n => n[0]).join('').slice(0,2)) || "?" }
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-white">{currentApp.applicant?.name || "Unknown Applicant"}</div>
                      <div className="text-sm text-white/80">{currentApp.applicant?.email || "—"} • {currentApp.applicant?.location || "—"}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/80">Experience</div>
                      <div className="text-white">{currentApp.applicant?.experienceLevel || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Applied On</div>
                      <div className="text-white">{ currentApp.appliedAt ? new Date(currentApp.appliedAt).toLocaleString() : (currentApp.createdAt ? new Date(currentApp.createdAt).toLocaleString() : "—") }</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-white/80 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      { Array.isArray(currentApp.applicant?.skills) && currentApp.applicant!.skills.length > 0
                        ? currentApp.applicant!.skills.map((s:any) => <span key={typeof s === "string" ? s : s.id} className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm">{typeof s === "string" ? s : s.name}</span>)
                        : <div className="text-white/80">No skills listed</div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <button onClick={() => UpdateRating(currentApp.id, "Hireable")} className="px-3 py-2 rounded bg-emerald-600 text-white">Hireable</button>
                  <button onClick={() => UpdateRating(currentApp.id, "Wait")} className="px-3 py-2 rounded bg-yellow-500 text-white">Wait</button>
                  <button onClick={() => UpdateRating(currentApp.id, "Unacceptable")} className="px-3 py-2 rounded bg-red-600 text-white">Unacceptable</button>
                  {activeTab === "Hireable" && (() => {
                    const offerRaw = currentApp.offerStatus ? String(currentApp.offerStatus).toLowerCase() : null;
                    const isPending = offerRaw === "pending";
                    const isAccepted = offerRaw === "accepted";

                    return (
                      <button
                        onClick={() => { if (!isPending && !isAccepted) offerJob(currentApp.id); }}
                        disabled={isPending || isAccepted}
                        className={`px-3 py-2 rounded text-white ${isAccepted ? "bg-zinc-700" : isPending ? "bg-zinc-700" : "bg-indigo-600"} disabled:opacity-60`}
                      >
                        {isAccepted ? "Accepted" : isPending ? "Offered" : "Offer Job"}
                      </button>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <div className="text-sm text-white/80">{ currentList.length > 0 ? `${currentIndex + 1} / ${currentList.length}` : "0 / 0" }</div>
                  <button onClick={prev} disabled={currentIndex <= 0} className="px-3 py-1 rounded border border-zinc-700 text-white disabled:opacity-40">Prev</button>
                  <button onClick={next} disabled={currentIndex >= (currentList.length - 1)} className="px-3 py-1 rounded border border-zinc-700 text-white disabled:opacity-40">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}