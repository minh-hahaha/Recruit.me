import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Job, JobStatus } from "../entities";

const dirPath = path.join(process.cwd(), "tempData");
const filePath = path.join(dirPath, "jobs.json");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, companyId, positions, skills, status } = body;

        // Validation
        if (!title || title.trim() === "") {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        if (!description || description.trim() === "") {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }
        if (!companyId || companyId.trim() === "") {
            return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
        }

        // Verify company exists
        const companiesPath = path.join(dirPath, "companies.json");
        try {
            const companiesData = await fs.readFile(companiesPath, "utf-8");
            const companies = JSON.parse(companiesData);
            const companyExists = companies.some((c: any) => String(c.id) === String(companyId));
            if (!companyExists) {
                return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
        }

        // Create job
        const jobStatus = status && Object.values(JobStatus).includes(status) 
            ? status 
            : JobStatus.Draft;
        const job = new Job(
            title,
            description,
            companyId,
            positions || 1,
            jobStatus
        );

        // Ensure directory exists
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (e) {
            console.error("Failed to create directory:", e);
        }

        // Read existing jobs
        let jobs;
        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            jobs = JSON.parse(fileData);
        } catch {
            jobs = [];
        }

        // Add skills to the job object (skills not in Job class but needed in JSON)
        const jobWithSkills = {
            ...job,
            skills: skills || []
        };

        jobs.push(jobWithSkills);

        await fs.writeFile(filePath, JSON.stringify(jobs, null, 2));

        return NextResponse.json({
            id: job.id,
            createdAt: job.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("Error in POST createJob:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
