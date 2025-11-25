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

        const sql = `
      UPDATE applications
      SET offerStatus = ?, respondedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        await query(sql, [rating, applicationId]);

        return createResponse(200, { applicationId, rating });
    } catch (error) {
        return handleError(error, `Failed to accept offer: ${error.message}`);
    }
};