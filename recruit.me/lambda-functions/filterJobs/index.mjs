import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { title, description, skills, companyName } = body;

        const jobsSql = `
            SELECT 
            j.*,
            c.name AS companyName
            FROM jobs j
            LEFT JOIN companies c 
            ON j.companyID = c.id
            ORDER BY j.createdAt DESC
        `;

        const jobs = await query(jobsSql);

        // get skills for each job

        const jobsWithSkills = await Promise.all(
            jobs.map(async (job) => {
                // Join with skills table to get skill names
                const skillsSql = `
                    SELECT s.name 
                    FROM job_skills js
                    INNER JOIN skills s ON js.skillID = s.id
                    WHERE js.jobID = ?
                `;
                const skills = await query(skillsSql, [job.id]);

                return {
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    companyID: job.companyID,
                    companyName: job.companyName,
                    status: job.status,
                    positions: job.positions || 1,
                    skills: skills.map(s => ({ name: s.name })),
                    applicantCount: job.applicantCount || 0,
                    hiredCount: job.hiredCount || 0,
                    createdAt: job.createdAt,
                    updatedAt: job.updatedAt,
                }}
            )
        );

        return createResponse(200, jobsWithSkills);
    } catch (error) {
        return handleError(error, 'Failed to get jobs');
    }
}