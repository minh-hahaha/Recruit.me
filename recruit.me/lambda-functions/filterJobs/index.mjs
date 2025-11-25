import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { applicantId, title, skills, companyName } = body;

        let jobsSql = `
            SELECT DISTINCT
                j.*,
                c.name AS companyName
            FROM jobs j
                     LEFT JOIN companies c ON j.companyID = c.id
        `;

        const hasSkills = Array.isArray(skills) && skills.length > 0;
        if (hasSkills) {
            jobsSql += `
        INNER JOIN job_skills js ON js.jobID = j.id
        INNER JOIN skills s ON js.skillID = s.id
      `;
        }

        const conditions = ["j.status = 'Active'"];
        const params = [];

        if (applicantId) {
            conditions.push(`
        NOT EXISTS (
          SELECT 1
          FROM applications a
          WHERE a.jobID = j.id
          AND a.applicantID = ?
        )
      `);
            params.push(applicantId);
        }

        if (title) {
            conditions.push("j.title LIKE ?");
            params.push(`%${title}%`);
        }

        if (companyName) {
            conditions.push("c.name LIKE ?");
            params.push(`%${companyName}%`);
        }

        if (hasSkills) {
            const placeholders = skills.map(() => "?").join(",");
            conditions.push(`s.name IN (${placeholders})`);
            params.push(...skills);
        }

        if (conditions.length > 0) {
            jobsSql += " WHERE " + conditions.join(" AND ");
        }

        if (hasSkills) {
            jobsSql += `
        GROUP BY j.id
        HAVING COUNT(DISTINCT s.name) > 0
      `;
            params.push(skills.length);
        }

        jobsSql += " ORDER BY j.createdAt DESC";

        const jobs = await query(jobsSql, params);

        const jobsWithSkills = await Promise.all(
            jobs.map(async (job) => {
                const skillsSql = `
                    SELECT s.name
                    FROM job_skills js
                             INNER JOIN skills s ON js.skillID = s.id
                    WHERE js.jobID = ?
                `;
                const jobSkills = await query(skillsSql, [job.id]);

                return {
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    companyID: job.companyID,
                    companyName: job.companyName,
                    status: job.status,
                    positions: job.positions || 1,
                    skills: jobSkills.map(s => ({ name: s.name })),
                    applicantCount: job.applicantCount || 0,
                    hiredCount: job.hiredCount || 0,
                    createdAt: job.createdAt,
                    updatedAt: job.updatedAt,
                };
            })
        );

        return jobsWithSkills;
    } catch (error) {
        return handleError(error, `Failed to get jobs: ${error.message}`);
    }
}