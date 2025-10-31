import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { JobStatus } from "../entities";

const dirPath = path.join(process.cwd(), "tempData");
const filePath = path.join(dirPath, "jobs.json");

async function writeFileAtomic(p: string, data: string) {
  const tmp = p + ".tmp";
  await fs.writeFile(tmp, data, "utf-8");
  await fs.rename(tmp, p);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, title, description, positions, skills, status } = body;

        if (!id) {
            return NextResponse.json({ error: "Job id is required" }, { status: 400 });
        }

        // Read existing jobs
        let jobs;
        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            jobs = JSON.parse(fileData);
        } catch {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Find job index
        const jobIndex = jobs.findIndex((j: any) => String(j.id) === String(id));
        if (jobIndex === -1) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        const currentJob = jobs[jobIndex];

        // Update job fields
        const updated = {
            ...currentJob,
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(positions !== undefined ? { positions } : {}),
            ...(status !== undefined && Object.values(JobStatus).includes(status) 
                ? { status } 
                : {}),
            ...(skills !== undefined ? { skills } : {}),
            updatedAt: new Date().toISOString(),
        };

        jobs[jobIndex] = updated;
        await writeFileAtomic(filePath, JSON.stringify(jobs, null, 2));

        return NextResponse.json({
            id: updated.id,
            title: updated.title,
            description: updated.description,
            companyID: updated.companyID,
            status: updated.status,
            positions: updated.positions || 1,
            skills: updated.skills || [],
            applicantCount: updated.applicantCount || 0,
            hiredCount: updated.hiredCount || 0,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    } catch (error) {
        console.error("Error in POST editJob:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
