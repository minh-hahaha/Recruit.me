"use client";

import React, {Suspense, useEffect, useState} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = "https://8f542md451.execute-api.us-east-1.amazonaws.com/prod";

type Skill = { id: string; name: string };

export default function SkillsSearchPage() {
  return (
      <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
        <SkillsSearch />
      </Suspense>
  );
}

function SkillsSearch() {
  const params = useSearchParams();
  const router = useRouter();
  const cid =
    params.get("cid") || (typeof window !== "undefined" ? sessionStorage.getItem("companyId") || "" : "");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchLoading, setSearchLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSkills(true);
      try {
        const res = await fetch(`${API_BASE_URL}/applicant/listSkills`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load skills");
        const body = await res.json();
        if (!mounted) return;
        setSkills(Array.isArray(body) ? body.map((s: any) => ({ id: s.id, name: s.name })) : []);
      } catch (e) {
        console.error(e);
        if (mounted) setSkills([]);
      } finally {
        if (mounted) setLoadingSkills(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function doSearch() {
    setError(null);
    setSearchLoading(true);
    setCount(null);
    try {
      if (!cid) throw new Error("Missing company id");
      const skillArray = Array.from(selected);
      if (skillArray.length === 0) {
        setCount(0);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/company/getApplicantsBySkills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: cid, skills: skillArray }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `status ${res.status}`);
      }
      const body = await res.json();
      setCount(typeof body.count === "number" ? body.count : Number(body.count || 0));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  function toggleSkill(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <main className="min-h-screen py-10 px-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Find Applicants by Skills</h1>
          <div className="flex gap-2">
            <Link href={`/company/profile?cid=${encodeURIComponent(cid)}`}>
              <button className="px-3 py-1 border rounded">Back</button>
            </Link>
            <button onClick={() => router.back()} className="px-3 py-1 border rounded">
              Close
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
            Select skills to match applicants who have all selected skills.
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-auto p-2 border rounded bg-zinc-50 dark:bg-zinc-800">
            {loadingSkills && <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading skills...</div>}
            {!loadingSkills && skills.length === 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No skills available</div>
            )}
            {skills.map((s) => (
              <label key={s.id} className="flex items-center gap-2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={(e) => toggleSkill(s.id, e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {count !== null ? `Matched applicants: ${count}` : "Select skills and press Search"}
            </div>
            {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelected(new Set());
                setCount(null);
                setError(null);
              }}
              className="px-3 py-2 border rounded"
            >
              Clear
            </button>
            <button
              onClick={doSearch}
              disabled={searchLoading}
              className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}