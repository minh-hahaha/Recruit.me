"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Company } from "@/app/api/entities";

type FormState = {
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  password?: string;
};

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

export default function CompanyEditPage() {
  const params = useSearchParams();
  const router = useRouter();
  const cid =
    params.get("cid") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("companyId") || "" : "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    password: "",
  });

  useEffect(() => {
    if (!cid) {
      setError("No company id provided");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        console.log(cid);
        const res = await fetch(`${API_BASE_URL}/company/getCompany/?id=${encodeURIComponent(cid)}`, { method: 'GET', cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Failed to load company (${res.status})`);
        }
        const data: Company = await res.json();
        setForm({
          name: data.name ?? "",
          industry: data.industry ?? "",
          location: data.location ?? "",
          website: data.website ?? "",
          description: data.description ?? "",
          password: "",
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load company");
      } finally {
        setLoading(false);
      }
    })();
  }, [cid]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cid) {
      setError("No company id provided");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/company/editCompany/?id=${encodeURIComponent(cid)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Save failed (${res.status})`);
      }
      router.push(`/company/profile?cid=${encodeURIComponent(cid)}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800 text-center">
          Loading company...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="w-full flex flex-col md:flex-row justify-between bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Edit Company Profile</h1>
            <p className="text-white/80 mt-1 text-sm">Update company details visible to applicants.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push(`/company/profile?cid=${encodeURIComponent(cid)}`)}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition border border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Company Details</h2>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              These details will be shown on your public company profile.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <label className="flex flex-col">
              <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-6">
              <label className="flex flex-col">
                <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Industry</span>
                <input
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Location</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Website</span>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Change password (optional)</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </label>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg px-5 py-2 font-medium transition bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/company/profile?cid=${encodeURIComponent(cid)}`)}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 border bg-transparent"
              >
                Cancel
              </button>

              {error && <div className="text-sm text-red-600 mt-2 md:mt-0">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}