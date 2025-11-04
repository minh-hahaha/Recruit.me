import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  try {
    const id =
      (event?.queryStringParameters && event.queryStringParameters.id) ||
      (event?.pathParameters && event.pathParameters.id) ||
      null;

    if (!id) {
      return createResponse(400, { error: 'Missing company id. Provide ?id=<companyId>.' });
    }

    const sql = `SELECT id, name, industry, location, website, description, createdAt, updatedAt
                 FROM companies WHERE id = ? LIMIT 1`;
    const rows = await query(sql, [id]);

    if (!rows || rows.length === 0) {
      return createResponse(404, { error: 'Company not found' });
    }

    return createResponse(200, rows[0]);
  } catch (error) {
    return handleError(error, 'Failed to get company');
  }
};