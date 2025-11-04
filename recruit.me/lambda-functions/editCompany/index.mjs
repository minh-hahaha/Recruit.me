import { getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  let connection;
  try {
    const body = JSON.parse(event.body || '{}');
    const id =
      (event?.queryStringParameters && event.queryStringParameters.id) ||
      (event?.pathParameters && event.pathParameters.id) ||
      body.id;

    if (!id) return createResponse(400, { error: 'Missing company id' });

    const allowed = ['name', 'industry', 'location', 'website', 'description', 'password'];
    const updates = [];
    const params = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push(`${key} = ?`);
        params.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return createResponse(400, { error: 'No updatable fields provided' });
    }

    // add updatedAt and id param
    updates.push('updatedAt = ?');
    params.push(new Date());
    params.push(id);

    connection = await getConnection();

    // Run update on connection
    await new Promise((resolve, reject) => {
      const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
      connection.query(sql, params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // return updated company
    const [company] = await new Promise((resolve, reject) => {
      connection.query('SELECT id, name, industry, location, website, description, createdAt, updatedAt FROM companies WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      });
    });

    return createResponse(200, company || {});
  } catch (error) {
    return handleError(error, 'Failed to edit company');
  } finally {
    if (connection) connection.release();
  }
};