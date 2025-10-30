import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "tempData", "applicants.json");

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Applicant id is required" }, { status: 400 });

    const raw = await fs.readFile(filePath, "utf-8");
    const list = JSON.parse(raw) as any[];
    const a = list.find(x => String(x.id) === String(id));
    if (!a) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    // normalized shape
    return NextResponse.json({
      id: a.id,
      name: a.name ?? "",
      email: a.email ?? "",
      location: a.location ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: Array.isArray(a.skills)
        ? a.skills.map((s: any) => (typeof s === "string" ? { name: s } : { name: s.name }))
        : [],
    });
  } catch (e) {
    console.error("reviewProfile error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
