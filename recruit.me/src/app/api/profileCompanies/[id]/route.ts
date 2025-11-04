import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Company } from "@/app/api/entities";

const filePath = path.join(process.cwd(), "tempData", "companies.json");

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const fileData = await fs.readFile(filePath, "utf-8");
    const companies: Company[] = JSON.parse(fileData);

    const c = companies.find((company) => String(company.id) === String(id));
    if (!c) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    return NextResponse.json({
      id: c.id,
      name: c.name ?? "",
      industry: c.industry ?? "",
      location: c.location ?? "",
      website: c.website ?? "",
      description: c.description ?? "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const updates = await req.json();

    const fileData = await fs.readFile(filePath, "utf-8");
    const companies: Company[] = JSON.parse(fileData);

    const idx = companies.findIndex((company) => String(company.id) === String(id));
    if (idx === -1) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const existing = companies[idx];

    // whitelist editable fields matching Company constructor
    const allowed = ["name", "industry", "location", "website", "description", "password"];
    const merged: Partial<Company> = { ...existing };

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        // @ts-ignore - dynamic assignment from incoming JSON
        merged[key] = updates[key];
      }
    }

    // ensure immutable fields remain unchanged
    merged.id = existing.id;
    merged.createdAt = existing.createdAt;

    companies[idx] = merged as Company;
    await fs.writeFile(filePath, JSON.stringify(companies, null, 2), "utf-8");

    return NextResponse.json({
      id: merged.id,
      name: merged.name ?? "",
      industry: merged.industry ?? "",
      location: merged.location ?? "",
      website: merged.website ?? "",
      description: merged.description ?? "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}