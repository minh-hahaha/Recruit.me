import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const qs = event?.queryStringParameters || {};

        const rawBody = event.body ?? {};
        let body = {};
        if (typeof rawBody === 'string' && rawBody.length > 0) {
            try {
                body = JSON.parse(rawBody);
            } catch {
                body = {};
            }
        } else if (rawBody && typeof rawBody === 'object') {
            body = rawBody;
        }

        const applicationId =
            body.applicationId || body.applicationID || body.id ||
            qs.applicationId || qs.applicationID || qs.id || null;

        const rating = 'Accepted';

        if (!applicationId) {
            return createResponse(400, { error: 'Missing applicationId', received: { query: qs, parsedBody: body } });
        }

        // Check if application is already withdrawn or offer is rejected
        const existing = await query(
            'SELECT status, offerStatus FROM applications WHERE id = ?',
            [String(applicationId)]
        );

        if (existing.length === 0) {
            return createResponse(404, { error: 'Application not found' });
        }

        if (existing[0].status === 'Withdrawn') {
            return createResponse(400, { error: 'Cannot accept offer for withdrawn application' });
        }

        // update by Minh to handle frontend logic of accepting offer
        const sql = `
      UPDATE applications
      SET offerStatus = ?, status = 'Applied', respondedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        await query(sql, [rating, applicationId]);

        return createResponse(200, { applicationId, rating });
    } catch (error) {
        return handleError(error, `Failed to accept offer: ${error.message}`);
    }
};