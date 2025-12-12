import { query, createResponse, handleError } from './db-utils.mjs';

function splitCsvOrJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
}

export const handler = async (event) => {
  try {
    let body = {};
    if (event?.body) {
      try { body = JSON.parse(event.body); } catch { body = {}; }
    }

    const qs = event?.queryStringParameters || {};

    let skills = Array.isArray(body.skills) ? body.skills : splitCsvOrJson(body.skills);
    if (!skills.length) skills = splitCsvOrJson(qs.skills || qs.skillIds || qs.skill);

    skills = Array.isArray(skills) ? skills.filter(Boolean) : [];

    if (!skills.length) {
      return createResponse(400, { error: 'Provide a non-empty skills array in the request body or query string' });
    }

    // count applicants who have ALL selected skills
    const placeholders = skills.map(() => '?').join(', ');
    const sql = `
      SELECT COUNT(*) AS count FROM (
        SELECT ap.id
        FROM applicants ap
        JOIN applicant_skills aps ON aps.applicantID = ap.id
        WHERE aps.skillID IN (${placeholders})
        GROUP BY ap.id
        HAVING COUNT(DISTINCT aps.skillID) = ?
      ) t
    `;
    const params = [...skills, skills.length];
    const rows = await query(sql, params);
    const count = rows && rows[0] && (rows[0].count ?? rows[0].COUNT ?? 0);

    return createResponse(200, { count: Number(count || 0) });
  } catch (error) {
    return handleError(error, 'Failed to get applicants by skills');
  }
};