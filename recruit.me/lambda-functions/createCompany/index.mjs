import { v4 as uuidv4 } from 'uuid';
import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  let connection;
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, password = '', industry = '', location = '', website = '', description = '' } = body;

    if (!name || String(name).trim() === '') {
      return createResponse(400, { error: 'Name is required' });
    }

    const id = uuidv4();
    const createdAt = new Date();

    connection = await getConnection();
    const insertSql = `
      INSERT INTO companies (id, name, password, industry, location, website, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(insertSql, [id, name, password, industry, location, website, description, createdAt, createdAt]);

    return createResponse(201, {
      id,
      name,
      industry,
      location,
      website,
      description,
      createdAt: createdAt.toISOString(),
    });
  } catch (error) {
    return handleError(error, 'Failed to create company');
  } finally {
    if (connection) connection.release();
  }
};