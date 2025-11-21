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
            [String(applicantId)],
        );

         if (existingApplication.length === 0) {
            return createResponse(404, { error: 'Application not found' });
        }

        const existing = existingApplication[0];

        if (existing.status === 'Withdrawn') {
            return createResponse(200, { message: 'Application has already been withdrawn',
                application: existing });
             }
        
        await query(
            `UPDATE applications SET status = 'Withdrawn', withdrawnAt = NOW(), updatedAt = NOW() WHERE id = ?`,
            ['Withdrawn', String(applicationId)],
        );

        const updatedApplication = await query(
            `SELECT id, applicantID, jobID, companyID, status, rating, offerStatus, appliedAt, withdrawnAt FROM applications WHERE id = ?`,
            [String(applicationId)],
        );

        const updated = updatedApplication[0];

        return createResponse(200, { message: 'Application withdrawn successfully', application: updated });

    } catch (error) {
        console.error('Error withdrawing application:', error);
        return handleError(error, 'Failed to withdraw application');
    } finally {
        connection.release();
    }

    };