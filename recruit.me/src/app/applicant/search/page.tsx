"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {Job, Skill} from "@/app/api/entities";

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
            <SearchJobs />
        </Suspense>
    );
}

function SearchJobs() {
    const params = useSearchParams();
    const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false)
    const buttonRef = useRef(null)
    const [selected, setSelected] = useState<string[]>([])
    const [skills, setSkills] = useState<Skill[]>([])
    const [jobs, setJobs] = useState<Job[]>([])
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");

    const toggleOption = (value: string) => {
        setSelected(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        )
    }

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/job/filterJob`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    body: JSON.stringify({
                        applicantId: aid?.trim(),
                        title: title?.trim() || null,
                        skills: selected.length > 0 ? selected : null,
                        companyName: company?.trim() || null,
                    })
                }),
            })

            if (!res.ok) throw new Error(await res.text());
            const jobsList = await res.json();
            setJobs(jobsList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!aid) {
            setError("No applicant ID provided");
            setLoading(false);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                console.log("Fetching applicant from:", `${API_BASE_URL}/applicant/review`);
                const [skillsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/applicant/listSkills`, {
                        method: "GET",
                        cache: "no-store",
                    }),
                ]);

                const [jobsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/job/filterJob`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            body: JSON.stringify({
                                applicantId: aid?.trim(),
                                title: title?.trim() || null,
                                skills: selected.length > 0 ? selected : null,
                                companyName: company?.trim() || null,
                            })
                        }),
                    })
                ]);

                if (!skillsRes.ok) throw new Error(await skillsRes.text());
                if (!jobsRes.ok) throw new Error(await jobsRes.text());

                const skillsList: Skill[] = await skillsRes.json();
                setSkills(skillsList)

                const jobsList: Job[] = await jobsRes.json();
                setJobs(jobsList);
            } catch (e: any) {
                console.error("Failed to load profile:", e?.message || e);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
    }, [aid]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center">
                <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center">
            {error && <div className="text-red-600 dark:text-red-400 mt-3">{error}</div>}
            <div className="w-full flex flex-col md:flex-row justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-lg mb-8 text-left">
                <div className="px-4">
                    <h1 className="text-3xl font-semibold mb-1">Search Jobs</h1>
                    <p className="text-white/80">Find your next opportunity</p>
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
                    <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Search & Filter</h2>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Use filters to find jobs that match your skills and preferences
                    </span>
                    <div className="flex items-center gap-3 mt-4 md-0">
                        <div className="w-2/9">
                        <span className="mb-2 text-zinc-800 dark:text-zinc-200">Title</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>

                        <div className="w-2/9">
                            <span className="mb-2 text-zinc-800 dark:text-zinc-200">
                                Skill
                            </span>
                            <div className="relative w-full select-none">
                                <button ref={buttonRef} type="button" onClick={() => setOpen(prev => !prev)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                                    Select skills
                                    <i className={`fa-solid fa-chevron-down text-sm transition-transform ${ open ? "rotate-180" : "" }`} ></i>
                                </button>
                                {open && (
                                    <ul className="absolute left-0 mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                        {skills.map((skill) => (
                                            <li key={skill.id} onClick={() => toggleOption(skill.name)} className="px-3 py-2 flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                                <input type="checkbox" checked={selected.includes(skill.name)} onChange={() => toggleOption(skill.name)} className="accent-blue-600"/>
                                                {skill.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="w-2/9">
                        <span className="mb-2 text-zinc-800 dark:text-zinc-200">Company</span>
                            <input
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>

                        <div className="w-1/5">
                            <span className="mb-2 text-zinc-800 dark:text-zinc-200">Clear</span>
                            <button type="button" onClick={() => { setTitle(""); setCompany(""); setSelected([]); fetchJobs(); }} className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition">
                                Clear Filters
                            </button>
                        </div>
                        <div className="w-2/15">
                            <span className="mb-2 text-zinc-800 dark:text-zinc-200">Search</span>
                            <button type="button" onClick={fetchJobs} className="w-full rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition">
                                Search
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col items-start gap-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Job Results</h2>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Showing {jobs.length} jobs
                    </span>
                    <div className="mt-4 w-full border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm px-4 py-2">
                            <div className="w-1/5">Company</div>
                            <div className="w-1/5">Title</div>
                            <div className="w-2/5">Description</div>
                            <div className="w-1/5">Skills</div>
                            <div className="w-1/5 text-center">Action</div>
                        </div>

                        {jobs.map((job) => (
                            <div key={job.id} className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                                <div className="w-full md:w-1/5">
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400 md:hidden font-semibold">Company:</span>
                                    <span className="text-sm text-zinc-700 dark:text-zinc-200 md:text-base">{job.companyName}</span>
                                </div>

                                <div className="w-full md:w-1/5 mt-1 md:mt-0">
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400 md:hidden font-semibold">Title:</span>
                                    <span className="text-sm text-zinc-700 dark:text-zinc-50 md:text-base">{job.title}</span>
                                </div>

                                <div className="w-full md:w-2/5 mt-1 md:mt-0">
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400 md:hidden font-semibold">Description:</span>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 md:line-clamp-1">{job.description}</p>
                                </div>

                                <div className="w-full md:w-1/5 mt-1 md:mt-0">
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400 md:hidden font-semibold">Skills:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {job.skills.map((skill) => (
                                            <span key={skill.name} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-1/5 mt-2 md:mt-0 flex justify-end md:justify-end">
                                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition" onClick={() => router.push(`/applicant/apply?aid=${encodeURIComponent(aid)}&jobid=${encodeURIComponent(job.id)}`)}>
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}