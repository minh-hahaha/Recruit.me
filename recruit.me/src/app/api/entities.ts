import { v4 as uuidv4 } from "uuid";

export class Skill {
    name: string;
    level: string;

    constructor(name: string, level: string) {
        this.name = name;
        this.level = level;
    }
}

export class Applicant {
    id: string;
    name: string;
    email: string;
    location: string;
    experienceLevel: string;
    skills: Skill[];
    createdAt: Date;

    constructor(
        name: string,
        email = "",
        location = "",
        experienceLevel = "",
        skills: Skill[] = []
    ) {
        this.id = uuidv4();
        this.name = name;
        this.email = email;
        this.location = location;
        this.experienceLevel = experienceLevel;
        this.skills = skills;
        this.createdAt = new Date();
    }
}

export class Company {
    id: string;
    name: string;
    industry: string;
    location: string;
    website?: string;
    description: string;
    createdAt: Date;

    constructor(
        name: string,
        industry = "",
        location = "",
        description = "",
        website?: string
    ) {
        this.id = uuidv4();
        this.name = name;
        this.industry = industry;
        this.location = location;
        this.description = description;
        this.website = website;
        this.createdAt = new Date();
    }
}
