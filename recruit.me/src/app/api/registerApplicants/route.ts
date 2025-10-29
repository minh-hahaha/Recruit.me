import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Applicant } from "../entities";

const dirPath = path.join(process.cwd(), "tempData");
const filePath = path.join(dirPath, "applicants.json");

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const applicant = new Applicant(name);

        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (e) {
            console.error("Failed to create directory:", e);
        }

        let applicants;
        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            applicants = JSON.parse(fileData);
        } catch {
            applicants = [];
        }

        applicants.push(applicant);

        await fs.writeFile(filePath, JSON.stringify(applicants, null, 2));

        return NextResponse.json({
            id: applicant.id,
            createdAt: applicant.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("Error in POST:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
