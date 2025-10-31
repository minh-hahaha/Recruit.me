import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dirPath = path.join(process.cwd(), "tempData");
const filePath = path.join(dirPath, "jobs.json");

export async function GET(req: Request) {
    try {
        // Read existing jobs
        let jobs;
        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            jobs = JSON.parse(fileData);
        } catch {
            // If file doesn't exist, return empty array
            return NextResponse.json([]);
        }

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error in GET jobs:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
