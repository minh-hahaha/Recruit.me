import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const jobsSql = "SELECT * FROM jobs order by createdAt desc";
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