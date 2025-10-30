import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Applicant } from "@/app/api/entities";

const filePath = path.join(process.cwd(), "tempData", "applicants.json");

export async function GET(_req: Request, ctx: { params: Promise <{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const fileData = await fs.readFile(filePath, "utf-8");
    const applicants: Applicant[] = JSON.parse(fileData);     

    const a = applicants.find((applicant) => String(applicant.id) === String(id));
    if (!a) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    
    return NextResponse.json({
      id: a.id,
      name: a.name ?? "",
      email: a.email ?? "",
      location: a.location ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: (a.skills ?? []).map((s) => typeof s === "string" ? { name: s } : { name: s.name }),
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load applicant" }, { status: 500 });
  }
}