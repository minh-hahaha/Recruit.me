import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Company } from "../entities";

const dirPath = path.join(process.cwd(), "tempData");
const filePath = path.join(dirPath, "companies.json");

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const company = new Company(name);

        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (e) {
            console.error("Failed to create directory:", e);
        }

        let companies;
        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            companies = JSON.parse(fileData);
        } catch {
            companies = [];
        }

        companies.push(company);

        await fs.writeFile(filePath, JSON.stringify(companies, null, 2));

        return NextResponse.json({
            id: company.id,
            createdAt: company.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("Error in POST:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
