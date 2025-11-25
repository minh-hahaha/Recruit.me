import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const applicantId = event.pathParameters?.id;

        if (!applicantId) {
            return createResponse(400, { error: 'Missing applicant ID in path' });
        }

        const sql = `
            SELECT
               app.id,
               app.offerStatus,
               app.offeredAt,
               j.title          AS jobTitle,
               j.companyID      AS companyID,
               c.name           AS companyName,
               j.salary         AS jobSalary
             FROM applications app
                    JOIN jobs j      ON j.id = app.jobID
                    JOIN companies c ON c.id = j.companyID
             WHERE app.applicantID = ?
               AND app.offerStatus != 'None'
             ORDER BY app.offeredAt DESC
        `;

        const rows = await query(sql, [String(applicantId)]);

        const offers = rows.map(row => ({
            id: row.id,
            title: row.jobTitle,
            company: row.companyName,
            amount: row.jobSalary ?? "",
            offeredAt: row.offeredAt,
            status: row.offerStatus,
        }));

        return createResponse(200, offers);
    } catch (error) {
        console.error('Error getting applicant offers:', error);
        return handleError(error, 'Failed to get applicant offers');
    }
};

