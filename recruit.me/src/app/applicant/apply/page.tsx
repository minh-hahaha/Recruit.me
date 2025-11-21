"use client";

import { useEffect, useState, Suspense, cache } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {Applicant} from "@/app/api/entities";

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

type Job = {
  id: string;
  jobID: string;      
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
};

const baseContainerClasses =
  "min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex flex-col gap-8 items-center";


function ApplicantApplyContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Applicant info
  const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");
  const [data, setData] = useState<Applicant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");


  // Job info
  const jobid = params.get("jobid") || (typeof window !== "undefined" ? sessionStorage.getItem("jobID") || "" : "");
  const [jobData, setJobData] = useState<Job | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [jobSalary, setJobSalary] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);

  //submission confirmation
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("Congrats! Your application has been submitted.");
  const [submitting, setSubmitting] = useState(false);


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
        const a: Applicant = await response.json();
        
        if (!a) throw new Error("No applicant data found");

        setData(a);
        setName(a.name || "");
        setEmail(a.email || "");
        setLocation(a.location || "");
        setExperienceLevel(a.experienceLevel || "");
      } catch (e: any) {
        console.error("Failed to load applicant data:", e?.message || e);
        setError(e?.message || "Failed to load applicant data");
      } finally {
        setLoading(false);
      }
    })();
  }, [aid]
);  

useEffect(() => {
    console.log("Loading Job data for ID:", jobid);
    if (!jobid) {
      setJobError("No Job ID provided");
      setJobLoading(false);
      return;
    }

    (async () => {
      setJobLoading(true);
      setJobError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobid)}`,
        { method: 'GET', cache: 'no-store' });
        if (!response.ok) throw new Error(await response.text());
        const j: Job = await response.json();
        
        if (!j) throw new Error("No Job data found");

        setJobData(j);
        setTitle(j.title || "");
        setCompany(j.company || "");
        setDescription(j.description || "");
        setJobSalary(j.salary || "");
    } catch (e: any) {
        console.error("Failed to load job data:", e?.message || e);
        setJobError(e?.message || "Failed to load job data");
      } finally {
        setJobLoading(false);
      }
    })();
  }, [jobid]
); 
async function handleSubmit() {
   if (!aid || !jobid) {
    alert("Missing applicant ID or job ID.");
    return;
  }

  setSubmitting(true);
    try {
    // const res = await fetch(`${API_BASE_URL}/applications/apply`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     applicantID: aid,
    //     jobID: jobid,
    //     resumeUrl: "...",
    //     csvUrl: "...",
    //     skills,
    //   }),
    // });

    // if (!res.ok) throw new Error(await res.text());

    console.log("Submit clicked:", {
      applicantID: aid,
      jobID: jobid,
      resumeFile,
      csvFile,
      skills,
    });

    // Show success banner
    setSubmitMessage("Congrats! Your application has been submitted.");
    setSubmitSuccess(true);

    // Redirect to applicant profile after short delay
    setTimeout(() => {
      router.push(`/applicant/jobs`);
    }, 2000);

     } catch (e: any) {
    console.error("Failed to submit application:", e);
    setSubmitMessage("Something went wrong submitting your application.");
    setSubmitSuccess(true);
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className={baseContainerClasses}>
      <div className="bg-white dark:bg-zinc-900 shadow rounded-xl p-6 w-full max-w-5xl">

        {submitSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {submitMessage}
        </div>
        )}
        
        <h1 className="text-2xl font-semibold mb-4">Apply for {title}</h1>

        <h2 className="text-lg font-medium mt-4">Job Details</h2>
        <p><strong>Company:</strong> {company}</p>
        <p><strong>Salary:</strong> {jobSalary || "Not specified"}</p>
        <p className="mt-2 whitespace-pre-line">{description}</p>

        <h2 className="text-lg font-medium mt-6">Your Information</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Location:</strong> {location}</p>
        <p><strong>Experience Level:</strong> {experienceLevel}</p>

        <h2 className="text-lg font-medium mt-6">Resume</h2>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        />

        <h2 className="text-lg font-medium mt-6">CSV Upload</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

export default function ApplicantApplyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicantApplyContent />
    </Suspense>
  );
}


// pull info about job from the table using jobID from search params
// pull info about applicant from table using applicantID from search params
// display job info and applicant info
// have a place to upload resume and cover letter
// have a place to review/add skills
// submit application button that sends all info to applications table 