# Recruit.me

A full-stack recruitment platform that connects job applicants with companies, built for CS 509 (Team Maryland).

## Live Demo

**Production URL:** http://recruit-me3.s3-website-us-east-1.amazonaws.com/

## Overview

Recruit.me is a comprehensive job recruitment platform that facilitates the hiring process between applicants and companies. The platform supports three user types:

- **Applicants**: Search for jobs, apply to positions, manage applications, and accept/reject offers
- **Companies**: Post job listings, review applicants, manage offers, and search for candidates by skills
- **Admins**: Generate reports and manage platform content

## Architecture

### Frontend
- **Framework**: Next.js 16.0.0 (React 19.2.0)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: AWS S3 Static Website Hosting

### Backend
- **Runtime**: AWS Lambda Functions (Node.js ES Modules)
- **Database**: MySQL (RDS)
- **API**: RESTful endpoints via API Gateway

### Project Structure
```
recruit.me/
├── src/app/              # Next.js application pages
│   ├── applicant/        # Applicant-facing pages
│   ├── company/          # Company-facing pages
│   ├── admin/            # Admin pages
│   └── api/              # API route handlers
├── lambda-functions/     # AWS Lambda backend functions
│   ├── acceptOffer/
│   ├── applyToJob/
│   ├── createJob/
│   └── ... (30+ functions)
└── database/
    └── schema.sql        # MySQL database schema
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL database (local or RDS)
- AWS CLI configured (for Lambda deployment)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd recruit.me
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create the database using the provided schema:
```bash
mysql -u your_username -p < recruit.me/database/schema.sql
```

2. Update database connection settings in `lambda-functions/config.mjs`

### Backend Setup (Lambda Functions)

1. Navigate to the lambda functions directory:
```bash
cd recruit.me/lambda-functions
```

2. Install dependencies:
```bash
npm install
```

3. Package functions for deployment:
```bash
./package-lambdas.sh
```

4. Deploy to AWS Lambda (configure your deployment script as needed)

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `./package-lambdas.sh` - Package all Lambda functions into ZIP files

## Features & Use Cases

### Iteration 3

**Admin:**
- Administrative features (TBD)

**Company:**
- Review Applicants for Job

**Applicant:**
- Accept Offer

### Iteration 2

**Company:**
- Activate Job
- Close Job
- Review Applicants for Job
- Offer Jobs
- Rescind Offer to Applicant

**Applicant:**
- Search Jobs
- Apply to Job
- Accept Offer
- Withdraw from Job
- Reject Offer from Company

### Iteration 1

**Company:**
- Register Company
- Review Company Profile
- Edit Company Profile
- Create Job
- Edit Job

**Applicant:**
- Register Applicant
- Review Profile
- Edit Profile

## Database Schema

The database includes the following main entities:

- **Companies**: Company profiles and information
- **Applicants**: Applicant profiles and information
- **Jobs**: Job postings with status (Draft, Active, Closed)
- **Applications**: Application records linking applicants to jobs
- **Skills**: Centralized skills database
- **Applicant Skills**: Skills associated with applicant profiles
- **Job Skills**: Required skills for job postings
- **Application Skills**: Skills highlighted in specific applications
- **Admin**: Administrative user accounts

See `recruit.me/database/schema.sql` for the complete schema definition.

## Lambda Functions

The backend consists of 30+ Lambda functions handling various operations:

### Authentication & Registration
- `registerApplicants` - Applicant registration
- `registerCompanies` - Company registration
- `loginApplicants` - Applicant login
- `loginCompany` - Company login

### Profile Management
- `getApplicant` - Retrieve applicant profile
- `getCompany` - Retrieve company profile
- `editApplicant` - Update applicant profile
- `editCompany` - Update company profile

### Job Management
- `createJob` - Create new job posting
- `editJob` - Update job posting
- `getJob` - Retrieve job details
- `getJobById` - Get job by ID
- `filterJobs` - Search and filter jobs

### Application Management
- `applyToJob` - Submit job application
- `postApply` - Process application submission
- `getApply` - Retrieve application details
- `withdrawApplication` - Withdraw an application
- `reapplyApplication` - Reapply to a job

### Applicant Review & Offers
- `getApplicantsFromJob` - Get applicants for a job
- `reviewApplicant` - Review and rate applicants
- `editApplicantRating` - Update applicant rating
- `offerJob` - Send job offer to applicant
- `acceptOffer` - Accept a job offer
- `rejectOffer` - Reject a job offer
- `rescindOffer` - Rescind an offer
- `getApplicantOffers` - Get offers for an applicant
- `getCompanyOffers` - Get offers sent by company

### Skills & Search
- `listSkills` - Get all available skills
- `getApplicantsBySkills` - Search applicants by skills

### Reporting
- `reportApplicants` - Generate applicant reports
- `reportJobs` - Generate job reports

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda, Node.js
- **Database**: MySQL
- **Deployment**: AWS S3, AWS Lambda, AWS API Gateway
- **Development**: ESLint, Prettier

## License

This project is developed for CS 509 coursework.

## Team

Team Maryland - CS 509

---

For more details about specific features or implementation, refer to the source code in the respective directories.
