"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {Applicant, Skill} from "@/app/api/entities";

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';


function getInitials(fullName: string) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
      <EditProfileContent />
    </Suspense>
  );
}

function EditProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");


  useEffect(() => {
    if (!aid) {
      setError("No applicant ID provided");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [appRes, skillsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/applicants/reviewApplicant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ id: aid }),
        }),
        fetch(`${API_BASE_URL}/applicants/listSkills`, {
          method: "GET",
          cache: "no-store",
        }),
        ]);

        if (!appRes.ok) throw new Error(await appRes.text());
        if (!skillsRes.ok) throw new Error(await skillsRes.text());

        const a: Applicant & { skills?: { name: string }[] } = await appRes.json();
        const skillsList: Skill[] = await skillsRes.json();

        setAvailableSkills(skillsList);
        setName(a.name || "");
        setEmail(a.email || "");
        setPassword(a.password || "");
        setLocation(a.location || "");
        setExperienceLevel(a.experienceLevel || "");
        setSelectedSkillNames(a.skills?.map((s) => s.name) || []);

      } catch (e: any) {
        console.error("Failed to load profile:", e?.message || e);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
      })();
    }, [aid]);

    const addSkill = (name: string) => {
    const clean = name.trim();
    if (!clean || selectedSkillNames.includes(clean)) return;
    setSelectedSkillNames([...selectedSkillNames, clean]);
  };

    const removeSkill = (name: string) => {
    setSelectedSkillNames(selectedSkillNames.filter((s) => s !== name));
  };

   const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

async function handleSubmit(e?: React.FormEvent) {
  e?.preventDefault();
  if (!aid) {
    setError("No applicant ID provided");
    return;
  }
  setSaving(true);
  setError("");


  try {
    const res = await fetch(`${API_BASE_URL}/applicants/editApplicant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: aid,
        name,
        email,
        password,
        location,
        experienceLevel,
        skills: selectedSkillNames,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    router.push(`/applicant/profile?aid=${encodeURIComponent(aid)}`);
    router.refresh();
  } catch (e: any) {
    console.error("Failed to save profile:", e?.message || e);
    setError("Failed to save profile");
  } finally {
    setSaving(false);
  }
}

 

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
        <div className="h-16 w-16 rounded-full bg-white/20 mr-4" aria-hidden />
        <div>
          <h1 className="text-3xl font-semibold mb-1">Edit Profile</h1>
          <p className="text-white/80">Update your profile information and skills</p>
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
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Profile Overview</h2>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Basic details you can share with employers
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
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
              >
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8l8 6 8-6v10H4Z" />
              </svg>
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <label className="flex flex-col">
            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Name</span>
            <input 
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Email</span>
            <input 
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Password</span>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or update password"
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Location</span>
            <input 
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Experience Level</span>
            <input
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            />
          </label>
        </div>

       {/* Skills section */}
        <div className="mt-2">
        <div className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Skills</div>

        {/* Selected skills */}
        <div className="flex flex-wrap gap-2 w-full mb-3">
            {selectedSkillNames.length ? (
            selectedSkillNames.map((s) => (
                <span key={s} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-zinc-800 dark:text-zinc-100">
                {s}
                <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    className="-mr-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                    onClick={() => removeSkill(s)}
                >
                    ×
                </button>
                </span>
            ))
            ) : (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">No skills selected</span>
            )}
        </div>

        {/* add a custom skill by typing */}
        <div className="flex items-center gap-2 mb-3">
            <input
            placeholder="Add a custom skill (e.g., GraphQL)"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
                }
            }}
            />
            <button 
              type="button" 
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800" 
              onClick={addCustomSkill}
            >
              Add
            </button>
        </div>

        {/* Available skills (addable chips) */}
       <div className="flex flex-wrap gap-2 w-full">
          {availableSkills.map((s) => {
            const already = selectedSkillNames
              .some(n => n.toLowerCase() === s.name.toLowerCase());

            return (
              <button
                key={s.id}
                type="button"
                className={`px-3 py-1 rounded-full border text-sm transition ${
                  already
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                } 
                bg-white dark:bg-zinc-900 
                text-zinc-800 dark:text-white 
                border-zinc-300 dark:border-zinc-600`}
                onClick={() => addSkill(s.name)}          
                disabled={already}                       
                aria-label={already ? `${s.name} already added` : `Add ${s.name}`}
                title={already ? "Already added" : "Add"}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
                

        {/* Update / Cancel actions */}
        <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 mt-8">
          <button 
            type="submit" 
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full" 
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
          {error && <div className="text-red-600 dark:text-red-400 mt-3">{error}</div>}
        </div>
        </form>
      </div>
    </div>
  );
}
