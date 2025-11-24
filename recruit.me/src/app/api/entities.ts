import { v4 as uuidv4 } from "uuid";

export class Skill {
    id: string;
    name: string;
    level: string;

    constructor(name: string, level: string) {
        this.id = uuidv4();
        this.name = name;
        this.level = level;
    }
}

export class Applicant {
    static fromJSON(fromJSON: any): Applicant[] | PromiseLike<Applicant[]> {
        throw new Error("Method not implemented.");
    }
    id: string;
    name: string;
    email: string;
    password?: string;
    location: string;
    experienceLevel: string;
    skills: Skill[];
    createdAt: Date;

    constructor(
        name: string,
        email = "",
        password = "",
        location = "",
        experienceLevel = "",
        skills: Skill[] = []
    ) {
        this.id = uuidv4();
        this.name = name;
        this.email = email;
        this.password = password;
        this.location = location;
        this.experienceLevel = experienceLevel;
        this.skills = skills;
        this.createdAt = new Date();
    }
}

export class Company {
    id: string;
    name: string;
    password?: string;
    industry: string;
    location: string;
    website?: string;
    description: string;
    createdAt: Date;

    constructor(
        name: string,
        password = "",
        industry = "",
        location = "",
        description = "",
        website?: string
    ) {
        this.id = uuidv4();
        this.name = name;
        this.password = password;
        this.industry = industry;
        this.location = location;
        this.description = description;
        this.website = website;
        this.createdAt = new Date();
    }
}

export enum JobStatus {
    Draft = 'Draft',
    Active = 'Active',
    Closed = 'Closed'
}

export class Job {
    id: string;
    title: string;
    description: string;
    companyID: string;
    status: JobStatus;
    positions?: number;
    applicantCount: number;
    hiredCount: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        title: string,
        description: string,
        companyID: string,
        positions?: number,
        status: JobStatus = JobStatus.Draft
    ) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.companyID = companyID;
        this.status = status;
        this.positions = positions;
        this.applicantCount = 0;
        this.hiredCount = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export enum ApplicationStatus {
    Applied = 'Applied',
    Withdrawn = 'Withdrawn',
    Rejected = 'Rejected'}

export enum ApplicationRating {
    Hireable = 'Hirable',
    Waitlist = 'Wait',
    Unacceptable = 'Unacceptable'
} 

export enum offerStatus {
    None = 'None',
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    Rescinded = 'Rescinded'
}

export class Application {
    id: string;
    applicantID: string;
    jobID: string;
    companyID: string;
    status: ApplicationStatus;
    rating?: ApplicationRating;
    offerStatus: offerStatus;
    appliedAt?: Date;
    withdrawnAt?: Date;
    offeredAt?: Date;
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        applicantID: string,
        jobID: string,
        companyID: string,
    ) {
        this.id = uuidv4();
        this.applicantID = applicantID;
        this.jobID = jobID;
        this.companyID = companyID;
        this.status = ApplicationStatus.Applied;
        this.offerStatus = offerStatus.None;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
