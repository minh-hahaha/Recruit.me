import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { id } = body; // application ID

        if (!id) {
            return createResponse(400, { error: 'Offer ID is required' });
        }

        // Update offer status
        const sql = `
            UPDATE applications
            SET offerStatus = 'Rescinded', updatedAt = NOW()
            WHERE id = ? AND offerStatus IN ('Pending', 'Accepted') AND status = 'Applied'
        `;

        const result = await query(sql, [id]);

        if (result.affectedRows === 0) {
            return createResponse(404, { error: 'Offer not found or not in Pending or Accepted state' });
        }

        return createResponse(200, { message: 'Offer rescinded successfully', id });
    } catch (error) {
        return handleError(error, 'Failed to rescind offer');
    }
};
