import { query, createResponse, handleError } from './db-utils.mjs';

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

        const sql = 'SELECT id, name, createdAt FROM applicants WHERE name = ? AND password = ?';
        const applicants = await query(sql, [name, password]);

        if (applicants.length === 0) {
            return createResponse(404, { error: 'Name or password is incorrect.' });
        }

        const applicant = applicants[0];

        return createResponse(200, {
            message: 'Login successful',
            id: applicant.id,
            name: applicant.name,
            createdAt: applicant.createdAt,
        });
    } catch (error) {
        return handleError(error, 'Failed to log in applicant');
    }
};
