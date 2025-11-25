import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  const applicationId = event.pathParameters?.id;
  if (!applicationId) {
    return createResponse(400, { error: 'Missing applicant ID in path' });
  }

  const connection = await getConnection();

    try {
        const existingApplication = await query(
            'SELECT id, applicantID, jobID, companyID, status, appliedAt, withdrawnAt FROM applications WHERE id = ?',
            [String(applicationId)],
        );

         if (existingApplication.length === 0) {
            return createResponse(404, { error: 'Application not found' });
        }

        const existing = existingApplication[0];

        if (existing.status !== 'Withdrawn') {
            return createResponse(400, { message: 'Only withdrawn applications can be reapplied',
                application: existing });
             }
        
        await query(
            `UPDATE applications SET status = 'Applied', withdrawnAt = NULL, appliedAt = NOW(), updatedAt= NOW() WHERE id = ?`,
            [String(applicationId)],
        );

        await query(
            `UPDATE jobs SET applicantCount = COALESCE(applicantCount,0) + 1 WHERE id = ?`,
            [String(existing.jobID)]
        );

        const updatedApplication = await query(
            `SELECT id, applicantID, jobID, companyID, status, rating, offerStatus, appliedAt, withdrawnAt FROM applications WHERE id = ?`,
            [String(applicationId)],
        );

        const updated = updatedApplication[0];

        return createResponse(200, { message: 'Application reapplied successfully', application: updated });

    } catch (error) {
        console.error('Error reapplying application:', error);
        return handleError(error, 'Failed to reapply to job');
    } finally {
        connection.release();
    }

    };