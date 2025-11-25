import { query, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  try {
    const qs = event?.queryStringParameters || {};
    const jobId = qs.jobId || null;
    const companyId = qs.companyId || null;

    if (!jobId) {
      return createResponse(400, { error: 'Missing jobId. Provide ?jobId=<jobId>.' });
    }

    const params = [jobId];
    const companyFilter = companyId ? ' AND app.companyID = ?' : '';
    if (companyId) params.push(companyId);

    const sql = `
      SELECT
        app.id AS id,
        app.jobID,
        app.applicantID,
        app.companyID,
        app.status,
        app.rating,
        app.offerStatus,
        app.appliedAt,
        app.createdAt AS createdAt,
        ap.name AS applicantName,
        ap.email,
        ap.location,
        ap.experienceLevel,
        GROUP_CONCAT(DISTINCT s.name) AS skills
      FROM applications app
             JOIN applicants ap ON ap.id = app.applicantID
             LEFT JOIN applicant_skills aps ON aps.applicantID = ap.id
             LEFT JOIN skills s ON s.id = aps.skillID
      WHERE app.jobID = ? ${companyFilter} AND app.status = 'Applied'
      GROUP BY app.id
      ORDER BY app.createdAt DESC
    `;

    const rows = await query(sql, params);

    const result = (rows || []).map((r) => {
      const skills = r.skills ? String(r.skills).split(',').map((x) => x.trim()).filter(Boolean) : [];

      return {
        id: r.id,
        jobID: r.jobID,
        applicantID: r.applicantID,
        companyID: r.companyID,
        status: r.status,
        rating: r.rating,
        offerStatus: r.offerStatus,
        appliedAt: r.appliedAt,
        createdAt: r.createdAt,
        applicant: {
          id: r.applicantID,
          name: r.applicantName,
          email: r.email,
          location: r.location,
          experienceLevel: r.experienceLevel,
          skills,
        },
      };
    });

    return createResponse(200, result);
  } catch (error) {
    return handleError(error, 'Failed to get applicants for job');
  }
}