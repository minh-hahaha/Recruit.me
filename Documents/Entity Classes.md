# Entity Classes - Recruit.me

## Overview
Entity classes that define the core data model for the Recruit.me application.

## Model
The main model class that contains collections of all entities:
- `companies: Company[*]`
- `applicants: Applicant[*]`
- `jobs: Job[*]`
- `applications: Application[*]`
- `skills: Skill[*]`

## Entity Classes

### Company
- **Description**: Represents an employer that registers on Recruit.Me, maintains a profile, and posts jobs.
- **Attributes**:
  - `id: UUID`
  - `name: string`
  - `industry: string`
  - `location: string`
  - `website: string?`
  - `description: string`
  - `createdAt: dateTime`

### Applicant
- **Description**: Represents an individual who creates a profile, manages their skills, applies to jobs, and responds to offers.
- **Attributes**:
  - `id: UUID`
  - `name: string`
  - `email: string`
  - `location: string`
  - `experienceLevel: string`
  - `skills: Skill[]`
  - `createdAt: dateTime`

### Job
- **Description**: Represents a position (or positions) that a company creates, edits, opens, closes, and offers to applicants that can apply to them.
- **Attributes**:
  - `id: UUID`
  - `title: string`
  - `description: string`
  - `companyID: UUID`
  - `status: Enum {Draft, Active, Closed}`
  - `positions: int?`
  - `applicantCount: int`
  - `hiredCount: int`
  - `createdAt: dateTime`
  - `updatedAt: dateTime`

### Application
- **Description**: Represents and applicant's submission to a specific job, including the company's rating and any offers.
- **Attributes**:
  - `id: UUID`
  - `applicantID: UUID`
  - `jobID: UUID`
  - `companyID: UUID`
  - `status: Enum {Applied, Withdrawn}`
  - `rating: Enum {Hirable, Wait, Unacceptable}?`
  - `offerStatus: Enum {None, Pending, Accepted, Rejected, Rescinded}`
  - `appliedAt: dateTime?`
  - `withdrawnAt: dateTime?`
  - `offeredAt: dateTime?`
  - `respondedAt: dateTime?`
  - `createdAt: dateTime`
  - `updatedAt: dateTime`

### Skill
- **Description**: Represents a unique skill that can be associated with jobs, applicants, or specific applications.
- **Attributes**:
  - `id: UUID`
  - `name: string`

### JobSkill
- **Description**: Represents the skills required for that specific job.
- **Attributes**:
  - `id: UUID`
  - `skillId: UUID`

### ApplicantSkill
- **Description**: Represents the skills listed on an applicant's profile.
- **Attributes**:
  - `id: UUID`
  - `skillId: UUID`

### ApplicationSkill
- **Description**: Represents the skills listed on an application that the applicant chooses specifically when applying to a specific job (can be different from their profile).
- **Attributes**:
  - `id: UUID`
  - `skillID: UUID` 


### Admin
- **Description**: Represents an admin of Recruit.me
- **Attributes**:
  - `id: UUID`
  - `name: string`
  - `email: string`
  - `CreatedAt: dateTime`
