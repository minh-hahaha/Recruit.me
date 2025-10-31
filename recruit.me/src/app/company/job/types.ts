export interface Skill {
  id: string;
  name: string;
}

export enum JobStatus {
  Draft = 'Draft',
  Active = 'Active',
  Closed = 'Closed'
}

export interface Job {
  id?: string;
  title: string;
  description: string;
  companyID: string;
  status: JobStatus;
  positions?: number;
  applicantCount?: number;
  hiredCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  skills: Skill[];
}

export const mockSkills: Skill[] = [
  { id: "1", name: "JavaScript" },
  { id: "2", name: "TypeScript" },
  { id: "3", name: "React" },
  { id: "4", name: "Node.js" },
  { id: "5", name: "Python" },
  { id: "6", name: "Java" },
  { id: "7", name: "SQL" },
  { id: "8", name: "Git" },
  { id: "9", name: "AWS" },
  { id: "10", name: "Docker" }
];