"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {Applicant} from "@/app/api/entities";
import "./profile.css";


type Application = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  status: "Applied" | "Withdrawn" | "Interview" | "Offer" | "Rejected";
  appliedOn: string;
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
const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "Boston, MA",
    salary: "$120k–$150k",
    status: "Applied",
    appliedOn: "09/14/2025",
  },
  {
    id: "a2",
    title: "Data Scientist",
    company: "DataDynamics Inc",
    location: "New York, NY",
    salary: "$130k–$160k",
    status: "Withdrawn",
    appliedOn: "09/22/2025",
  },
];

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


export default function ApplicantProfilePage() {
  const params = useSearchParams();
  const router = useRouter();
  const aid = params.get("aid") || (typeof window !== "undefined" ? sessionStorage.getItem("applicantId") || "" : "");
  const [data, setData] = useState<Applicant | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [applications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [offers] = useState<Offer[]>(MOCK_OFFERS);


  useEffect(() => {
    console.log("Loading applicant data for ID:", aid);
    if (!aid) return;

    (async () => {
      try {
        const res = await fetch(`/api/profileApplicants/${encodeURIComponent(aid)}`, {cache: "no-store"});
        if (!res.ok) throw new Error(await res.text());
        const a: Applicant = await res.json();

    setData(a);
    setName(a.name || "");
    setEmail(a.email || "");
    setLocation(a.location || "");
    setExperienceLevel(a.experienceLevel || "");
  } catch (e: any) {
        console.error("Failed to load applicant data:", e?.message || e);
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

  if (!data) return <div className="profile-wrap">Loading...</div>;

  return (
    <div className="profile-wrap">
      {/* ==== WELCOME HEADER ==== */}
      <div className="welcome-header">
        <div className="avatar" aria-hidden />
        <div>
          <h1 className="welcome-title">Welcome back, {data.name.split(" ")[0]}!</h1>
          <p className="muted">
            {location || "—"} • {experienceLevel || "—"}
          </p>
        </div>
        <div className="header-actions">
              <button className="btn ghost">Search Jobs</button>
              <button className="btn primary" onClick={() => router.push(`/applicant/edit?aid=${encodeURIComponent(aid)}`)}>
                Edit Profile
              </button>
        </div>
      </div>

      {/* ==== METRICS BOXES ==== */}
      <div className="metrics-grid">
        <Metric label="Total Applications" value={totalApps} />
        <Metric label="Active Applications" value={activeApps} />
        <Metric label="Offers Received" value={offersCount} />
        <Metric label="Skills" value={skillCount} />
      </div>

      {/* ==== TWO COLUMN DASHBOARD ==== */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="left-col">
          {/* PROFILE OVERVIEW*/}
          <div className="card">
            <SectionHeader title="Profile Overview" />
            <div className="po-head">
              <div className="po-avatar" aria-hidden>
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
                    aria-hidden="true"
                  >
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8l8 6 8-6v10H4Z"/>
                  </svg>
                  <span>{email || "—"}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="po-skills">
              <div className="po-skills-title">Skills</div>
              <div className="chip-list">
                {(data?.skills?.length ? data.skills : []).map((s) => (
                  <span key={s.name} className="chip">{s.name}</span>
                ))}
                {!data?.skills?.length && <span className="muted">—</span>}
              </div>
            </div>
          </div>

          {/* RECENT APPLICATIONS */}
            <div className="card">
              <div className="section-head section-stack">
                <h2>Recent Applications</h2>
                <span className="muted">Track your job applications</span>
              </div>
              <div className="list list-cards">
                {applications.map((a) => (
                <div key={a.id} className="list-item">
                <div className="li-main">
                <div className="li-title">
                  <strong>{a.title}</strong>
                    <span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
                <div className="li-sub muted">
                  {a.company} • {a.location}
                  {a.salary ? ` • ${a.salary}` : ""}
                </div>
                <div className="li-meta muted">Applied {a.appliedOn}</div>
                </div>
                  <div className="li-actions">
                    {a.status === "Applied" ? (
                      <button className="btn ghost">Withdraw Application</button>
                    ) : a.status === "Withdrawn" ? (
                      <button className="btn ghost">Re-apply</button>
                    ) : null}
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>      
                    

        {/* RIGHT COLUMN */}
        <div className="right-col">
          {/* JOB OFFERS */}
          <div className="card">
            <div className="section-head section-stack">
              <h2>Job Offers</h2>
              <span className="muted">Manage your job offers</span>
            </div>

            <div className="offers">
              {offers.map((o) => (
                <div key={o.id} className="offer-card">
                  <div className="offer-header">
                    <div className="offer-title">{o.title}</div>
                    <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                  </div>

                  <div className="offer-company">{o.company}</div>
                  <div className="offer-salary">{o.amount || "—"}</div>
                  <div className="offer-date">Offered {o.offeredOn}</div>

                  <div className="offer-actions">
                    <button className="btn primary" disabled={o.status !== "Pending"}>
                      Accept
                    </button>
                    <button className="btn ghost" disabled={o.status !== "Pending"}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="card">
            <SectionHeader title="Quick Actions" subtitle="Shortcuts & helpful links" />
            <div className="quick-actions">
              <button className="btn primary w-full">Search New Jobs</button>
              <button className="btn ghost w-full">Upload Resume</button>
              <button className="btn subtle w-full">View Saved Jobs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Presentational helpers ---------- */
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric-card">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {subtitle ? <span className="muted">{subtitle}</span> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
