import { v4 as uuidv4 } from 'uuid';
import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
        const { name, password } = body;

        if (!name || name.trim() === '') {
        return createResponse(400, { error: 'Name is required' });
        }

        if (!password || password.trim() === '') {
        return createResponse(400, { error: 'Password is required' });
        }

        const existingSql = 'SELECT id FROM companies WHERE name = ?';
        const existingCompanies = await query(existingSql, [name]);

        if (existingCompanies.length > 0) {
        return createResponse(400, {
            error: 'Name already used, log in if that is your name or use a different one.',
        });
        }

        const connection = await getConnection();

        try {
            await query('START TRANSACTION');

            const companyId = uuidv4();
            const createdAt = new Date();

            const insertSql = `
                INSERT INTO companies (id, name, password, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?)
            `;
            await query(insertSql, [companyId, name, password, createdAt, createdAt]);

            await query('COMMIT');

            return createResponse(200, {
                id: companyId,
                name,
                createdAt: createdAt.toISOString(),
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        return handleError(error, 'Failed to register company');
    }
};