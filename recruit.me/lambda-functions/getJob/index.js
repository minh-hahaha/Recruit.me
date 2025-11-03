const { query, createResponse, handleError } = require('./db-utils.js');

exports.handler = async (event) => {
    try {
        const jobsSql = "SELECT * FROM jobs order by createdAt desc";
        const jobs = await query(jobsSql);

        // get skills for each job

        const jobsWithSkills = await Promise.all(
            jobs.map(async (job) => {
                const skillsSql = "SELECT skill_id FROM job_skills WHERE job_id = ?";
                const skills = await query(skillsSql, [job.id]);

                return {
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    companyID: job.company_id,
                    status: job.status,
                    positions: job.positions || 1,
                    skills: skills.map(s => ({ name: s.name })),
                    applicantCount: job.applicant_count || 0,
                    hiredCount: job.hired_count || 0,
                    createdAt: job.created_at,
                    updatedAt: job.updated_at,
                }}
            )
        );

        return createResponse(200, jobsWithSkills);
    } catch (error) {
        return handleError(error, 'Failed to get jobs');
    }
}