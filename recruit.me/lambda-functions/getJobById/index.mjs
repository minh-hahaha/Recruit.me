import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    const jobID = event.pathParameters?.id;
    if (!jobID) {
        return createResponse(400, { error: 'Missing job ID in path' });
    }

    const connection = await getConnection();

    try {

        // Load Job Core

        const job = await query(
            `SELECT id, title, description, companyID, status, positions, applicantCount, hiredCount, salary
       FROM jobs
       WHERE id = ?`,
            [String(jobID)]
        );

        if (job.length === 0) {
            return createResponse(404, { error: 'Job not found' });
        }

        const j = job[0];

        return createResponse(200, {
            id: j.id,
            title: j.title ?? "",
            description: j.description ?? "",
            companyID: j.companyID ?? "",
            status: j.status ?? "",
            positions: j.positions ?? "",
            applicantCount: j.applicantCount ?? "",
            hiredCount: j.hiredCount ?? "",
            salary: j.salary ?? "",
        });

    } catch (error) {
        console.error("get/jobs error:", error);
        return handleError(error, 'Failed to load jobs');
    } finally {
        connection.release();
    }
};