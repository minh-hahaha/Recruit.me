import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        console.log(body)
        const { id } = body; // application ID

        if (!id) {
            return createResponse(400, { error: 'Application ID is required' });
        }

        // Update offer status
        const sql = `
            UPDATE applications
            SET offerStatus = 'Pending', updatedAt = NOW(), offeredAt = NOW()
            WHERE id = ? AND status = 'Applied'
        `;

        const result = await query(sql, [id]);

        return createResponse(200, { message: 'Offer sent successfully', id });
    } catch (error) {
        return handleError(error, 'Failed to send offer');
    }
};
