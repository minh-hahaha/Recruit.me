import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "tempData", "applicants.json");

async function writeFileAtomic(p: string, data: string) {
  const tmp = p + ".tmp";
  await fs.writeFile(tmp, data, "utf-8");
  await fs.rename(tmp, p);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: "Applicant id is required" }, { status: 400 });

    const raw = await fs.readFile(filePath, "utf-8");
    const list = JSON.parse(raw) as any[];
    const i = list.findIndex(x => String(x.id) === String(id));
    if (i === -1) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    const current = list[i];
    const updated = {
      ...current,
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.password !== undefined ? { password: body.password } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.experienceLevel !== undefined ? { experienceLevel: body.experienceLevel } : {}),
      ...(body.skills !== undefined
        ? { skills: (body.skills as any[]).map(s => (typeof s === "string" ? { name: s } : { name: s.name })) }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    list[i] = updated;
    await writeFileAtomic(filePath, JSON.stringify(list, null, 2));

    return NextResponse.json({
      id: updated.id,
      name: updated.name ?? "",
      email: updated.email ?? "",
      location: updated.location ?? "",
      experienceLevel: updated.experienceLevel ?? "",
      skills: Array.isArray(updated.skills)
        ? updated.skills.map((s: any) => (typeof s === "string" ? { name: s } : { name: s.name }))
        : [],
    });
  } catch (e) {
    console.error("editProfile error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
