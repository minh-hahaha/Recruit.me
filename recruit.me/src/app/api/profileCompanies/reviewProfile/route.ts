import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "tempData", "companies.json");

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Company id is required" }, { status: 400 });

    const raw = await fs.readFile(filePath, "utf-8");
    const list = JSON.parse(raw) as any[];
    const a = list.find(x => String(x.id) === String(id));
    if (!a) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    return NextResponse.json({
      id: a.id,
      name: a.name ?? "",
      industry: a.industry ?? "",
      location: a.location ?? "",
      website: a.website ?? "",
      description: a.description ?? "",
    });
  } catch (e) {
    console.error("reviewProfile error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}