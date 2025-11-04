// index.js
import { query, getConnection, createResponse, handleError} from './db-utils.mjs';

export const handler = async (event) => {
  const applicantId = event.pathParameters?.id;
  if (!applicantId) {
    return {
      statusCode: (400, { error: 'Missing applicant ID in path' }),
    };
  }

  const connection = await getConnection();

  try {
    const applicant = await query(
      `SELECT id, name, email, location, password, experienceLevel
       FROM applicants
       WHERE id = ?`,
      [String(applicantId)]
    );

    if (applicant.length === 0) {
      return createResponse(404, { error: 'Applicant not found' });
    }

    const a = applicant[0];


    // Query skills linked to this applicant
    const skills = await query(
      `SELECT s.name, aks.level
         FROM skills s
         JOIN applicant_skills aks ON aks.skillID = s.id
        WHERE aks.applicantID = ?
        ORDER BY s.name ASC`,
      [String(applicantId)]
    );


    return createResponse(200, {
      id: a.id,
      name: a.name ?? "",
      password: a.password ?? "",
      email: a.email ?? "",
      location: a.location ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: skills.map(r => ({ name: r.name, level: r.level ?? null })),
    });

  } catch (error) {
    console.error("get/applicants error:", error);
    return handleError(error, 'Failed to load applicant');
  } finally {
    connection.release();
  }
};
