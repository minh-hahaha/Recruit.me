import { query, getConnection, createRepsonse, handleError}from './db-utils.mjs';

export const handler = async (event) => {
  try {
        let body = {};
        try { body = JSON.parse(event.body || "{}"); } catch {}
        const pathId = event.pathParameters?.id;
        const applicantId = pathId ?? body?.id;
        if (!applicantId) return createResponse(400, { error: "Applicant id is required" });

        const conn = await getConnection();
        const exec = (sql, params=[]) =>
            new Promise((resolve, reject) => conn.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
    
  try {
    // applicants: id, name, email, location, experienceLevel (camelCase)
    const applicant = await exec(
      `SELECT id, name, email, location, experienceLevel
         FROM applicants
        WHERE id = ?`,
      [String(applicantId)]
    );
    if (!applicants.length) return createResponse(404, { error: "Applicant not found" });

    const a = applicants[0];

    // skills list (names only) via join
    const skills = await exec(
      `SELECT s.name
         FROM skills s
         JOIN applicant_skills aks ON aks.skillID = s.id
        WHERE aks.applicantID = ?
        ORDER BY s.name ASC`,
      [String(applicantId)]
    );

    conn.release();
    return createResponse(200, {
      id: a.id,
      name: a.name ?? "",
      email: a.email ?? "",
      location: a.location ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: skills.map(r => ({ name: r.name })),
    });
  } catch (err) {
    try { conn.release(); } catch {}
    throw err;
  }

} catch (err) {
    return handleError(err, 'Failed to load applicant');
    }
};
    
