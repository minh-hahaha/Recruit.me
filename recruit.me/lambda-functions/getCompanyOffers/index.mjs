import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const companyId = event.queryStringParameters?.companyId;

        if (!companyId) {
            return createResponse(400, { error: 'Company ID is required' });
        }

        // Fetch applications with offer status
        const sql = `
            SELECT 
                app.id,
                a.name AS applicantName,
                j.title AS jobTitle,
                app.offerStatus AS status,
                app.offeredAt AS offeredOn
            FROM applications app
            JOIN applicants a ON app.applicantID = a.id
            JOIN jobs j ON app.jobID = j.id
            WHERE app.companyID = ? 
            AND app.offerStatus IN ('Pending', 'Accepted', 'Rejected', 'Rescinded')
            ORDER BY app.offeredAt DESC
        `;

        const offers = await query(sql, [companyId]);

        // Format dates and add placeholder amount
        const formattedOffers = offers.map(o => ({
            ...o,
            amount: "Some Salary", // placeholder
            offeredOn: o.offeredOn ? new Date(o.offeredOn).toISOString().split('T')[0] : null
        }));

        return createResponse(200, formattedOffers);
    } catch (error) {
        return handleError(error, 'Failed to fetch company offers');
    }
};

