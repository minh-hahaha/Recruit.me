-- Enhanced Recruit.Me Database Schema
-- Matches the full entity model specification

CREATE DATABASE IF NOT EXISTS recruitme;
USE recruitme;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS application_skills;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS applicant_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS applicants;
DROP TABLE IF EXISTS companies;

-- ADD ADMINS TABLE LATER

-- Companies table
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    industry VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applicants table
CREATE TABLE applicants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255),
    location VARCHAR(255),
    experienceLevel VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skills table (centralized skills database)
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applicant Skills (skills on applicant's profile)
CREATE TABLE applicant_skills (
    id VARCHAR(36) PRIMARY KEY,
    applicantID VARCHAR(36) NOT NULL,
    skillID VARCHAR(36) NOT NULL,
    level VARCHAR(100) DEFAULT 'Beginner',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_applicant_skills_applicant FOREIGN KEY (applicantID) REFERENCES applicants(id) ON DELETE CASCADE,
    CONSTRAINT fk_applicant_skills_skill FOREIGN KEY (skillID) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_applicant_id (applicantID),
    INDEX idx_skill_id (skillID),
    UNIQUE KEY unique_applicant_skill (applicantID, skillID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs table
CREATE TABLE jobs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    companyID VARCHAR(36) NOT NULL,
    status ENUM('Draft', 'Active', 'Closed') DEFAULT 'Draft',
    positions INT DEFAULT 1,
    applicantCount INT DEFAULT 0,
    hiredCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (companyID) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (companyID),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Skills (skills required for a job)
CREATE TABLE job_skills (
    id VARCHAR(36) PRIMARY KEY,
    jobID VARCHAR(36) NOT NULL,
    skillID VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_skills_job FOREIGN KEY (jobID) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_skills_skill FOREIGN KEY (skillID) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_job_id (jobID),
    INDEX idx_skill_id (skillID),
    UNIQUE KEY unique_job_skill (jobID, skillID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications table (ENHANCED with all fields from entity model)
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    applicantID VARCHAR(36) NOT NULL,
    jobID VARCHAR(36) NOT NULL,
    companyID VARCHAR(36) NOT NULL,
    status ENUM('Applied', 'Withdrawn') DEFAULT 'Applied',
    rating ENUM('Hirable', 'Wait', 'Unacceptable') NULL,
    offerStatus ENUM('None', 'Pending', 'Accepted', 'Rejected', 'Rescinded') DEFAULT 'None',
    appliedAt TIMESTAMP NULL,
    withdrawnAt TIMESTAMP NULL,
    offeredAt TIMESTAMP NULL,
    respondedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_applicant FOREIGN KEY (applicantID) REFERENCES applicants(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_job FOREIGN KEY (jobID) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_company FOREIGN KEY (companyID) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_applicant_id (applicantID),
    INDEX idx_job_id (jobID),
    INDEX idx_company_id (companyID),
    INDEX idx_status (status),
    INDEX idx_offer_status (offerStatus),
    UNIQUE KEY unique_application (applicantID, jobID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Skills (skills chosen for a specific application)
CREATE TABLE application_skills (
    id VARCHAR(36) PRIMARY KEY,
    applicationID VARCHAR(36) NOT NULL,
    skillID VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_skills_application FOREIGN KEY (applicationID) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_application_skills_skill FOREIGN KEY (skillID) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_application_id (applicationID),
    INDEX idx_skill_id (skillID),
    UNIQUE KEY unique_application_skill (applicationID, skillID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;