"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./edit.css";
import type {Applicant, Skill} from "@/app/api/entities";


function getInitials(fullName: string) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

// Mock data

const ALL_SKILLS: Skill[] = [
  { id: "s1", name: "React", level: "Intermediate" },
  { id: "s2", name: "JavaScript", level: "Intermediate" },
  { id: "s3", name: "TypeScript", level: "Intermediate" },
  { id: "s4", name: "Node.js", level: "Intermediate" },
  { id: "s5", name: "SQL", level: "Intermediate" },
  { id: "s6", name: "AWS", level: "Intermediate" },
];

export default function EditProfilePage() {
  const router = useRouter();
  const params = useSearchParams();
  const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Applicant | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const availableSkills = useMemo(() => ALL_SKILLS, []);

  useEffect(() => {
    if (!aid) {
      setError("No applicant ID provided");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/profileApplicants/reviewProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: aid }),
        });
        if (!res.ok) throw new Error(await res.text()); 
        const a: Applicant & { skills?: { name: string }[] } = await res.json();

        setName(a.name || "");
        setEmail(a.email || "");
        setLocation(a.location || "");
        setExperienceLevel(a.experienceLevel || "");

        const ids: string[] = [];
        (a.skills || []).forEach((s) => {
          const found = availableSkills.find((k) => k.name.toLowerCase() === s.name.toLowerCase());
          if (found) ids.push(found.id);
          else ids.push(`custom-${s.name.toLowerCase().replace(/\s+/g, "-")}`);
        });
        setSelectedSkillIds(ids);
      } catch (e: any) {
        console.error("Failed to load profile:", e?.message || e);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
      })();
    }, [aid, availableSkills]);
    

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    const id = `custom-${trimmed.toLowerCase().replace(/\s+/g, "-")}`;
    if (selectedSkillIds.includes(id)) return;
    setSelectedSkillIds([...selectedSkillIds, id]);
    setCustomSkill("");
  };

  const selectedSkills: Skill[] = [
    ...availableSkills.filter((s) => selectedSkillIds.includes(s.id)),
    ...selectedSkillIds
      .filter((id) => id.startsWith("custom-"))
      .map((id) => ({
        id,
        name: id.replace(/^custom-/, "").replace(/-/g, " "),
        level: "Beginner",
      })),
  ];

  const removeSkill = (id: string) =>
    setSelectedSkillIds((prev) => prev.filter((x) => x !== id));

async function handleSubmit(e?: React.FormEvent) {
  e?.preventDefault();
  if (!aid) {
    setError("No applicant ID provided");
    return;
  }
  setSaving(true);
  setError("");

  const skillNames = selectedSkills.map((s) => s.name);

  try {
    const res = await fetch("/api/profileApplicants/editProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: aid,
        name,
        email,
        location,
        experienceLevel,
        skills: skillNames,
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
    <div className="profile-wrap">
      <div className="card">Loading...</div>
    </div>
  );
}

  return (
    <div className="profile-wrap">
      {/* Header */}
      <div className="welcome-header">
        <div className="avatar" aria-hidden />
        <div>
          <h1 className="welcome-title">Edit Profile</h1>
          <p className="muted">Update your profile information and skills</p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => router.push(`/applicant/profile?aid=${encodeURIComponent(aid)}`)}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="card max-w-4xl w-full">
        <div className="section-head section-stack">
          <h2>Profile Overview</h2>
          <span className="muted">
            Basic details you can share with employers
          </span>
        </div>

        <div className="po-head">
          <div className="po-avatar">
            <span className="po-initials">{getInitials(name)}</span>
          </div>
          <div className="po-ident">
            <div className="po-name">{name || "—"}</div>
            <div className="po-email">
              <svg
                className="po-mail-icon"
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
        <div className="grid">
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="field">
            <span>Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>

          <label className="field">
            <span>Experience Level</span>
            <input
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            />
          </label>
        </div>

       {/* Skills section */}
        <div className="po-skills">
        <div className="po-skills-title">Skills</div>

        {/* Selected skills */}
        <div className="chip-list mb-3">
            {selectedSkills.length ? (
            selectedSkills.map((s) => (
                <span key={s.id} className="chip chip-selected">
                {s.name}
                <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    className="chip-close"
                    onClick={() => removeSkill(s.id)}
                >
                    ×
                </button>
                </span>
            ))
            ) : (
            <span className="muted">No skills selected</span>
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
            <button type="button" className="btn ghost" onClick={addCustomSkill}>
            Add
            </button>
        </div>

        {/* Available skills (addable chips) */}
        <div className="chip-catalog">
            {availableSkills.map((s) => {
            const already = selectedSkillIds.includes(s.id);
            return (
                <button
                key={s.id}
                type="button"
                className={`chip chip-add ${already ? "chip-disabled" : ""}`}
                onClick={() => {
                    if (!already) setSelectedSkillIds((prev) => [...prev, s.id]);
                }}
                aria-label={already ? `${s.name} already added` : `Add ${s.name}`}
                title={already ? "Already added" : "Add"}
                >
                <span className="chip-text">{s.name}</span>
                {!already && (
                    <svg
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    className="chip-plus"
                    >
                    <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z" />
                    </svg>
                )}
                </button>
            );
            })}
        </div>
        </div>


        {/* Update / Cancel actions */}
        <form onSubmit={handleSubmit}>
        <div className="actions actions-stacked mt-8">
          <button type="submit" className="btn primary w-full" disabled={saving}>
            {saving ? "Saving..." : "Update Profile"}
          </button>
          {error && <div className="error-msg mt-3">{error}</div>}
        </div>
        </form>
      </div>
    </div>
  );
}
