import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Company } from "../entities";

const filePath = path.join(process.cwd(), "tempData", "companies.json");

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        const fileData = await fs.readFile(filePath, "utf-8");
        const companies: Company[] = JSON.parse(fileData);

        const found = companies.find((c) => c.name === name);

        if (!found) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Login successful",
            id: found.id,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}