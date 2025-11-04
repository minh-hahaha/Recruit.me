
import { query, getConnection, createResponse, handleError}from './db-utils.mjs';

export const handler = async (event) => {
  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch {}
    const applicantId = body?.id;
    if (!applicantId) return createResponse(400, { error: "Applicant id is required" });

  const conn = await getConnection();

  const exec = (sql, params=[]) =>
    new Promise((resolve, reject) => conn.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));

  try {
    await exec("START TRANSACTION");

    // Ensure applicant exists
    const exists = await exec(
      `SELECT id FROM applicants WHERE id = ?`,
      [String(applicantId)]
    );
    if (!exists.length) {
      await exec("ROLLBACK");
      return createResponse(404, { error: "Applicant not found" });
    }

    // Build dynamic UPDATE from optional fields
    const fields = [];
    const vals = [];
    if (body.name !== undefined)             { fields.push("name = ?");             vals.push(body.name); }
    if (body.email !== undefined)            { fields.push("email = ?");            vals.push(body.email); }
    if (body.password !== undefined)         { fields.push("password = ?");         vals.push(body.password); }
    if (body.location !== undefined)         { fields.push("location = ?");         vals.push(body.location); }
    if (body.experienceLevel !== undefined)  { fields.push("experienceLevel = ?");  vals.push(body.experienceLevel); }

    if (fields.length) {
      fields.push("updatedAt = NOW()");
      vals.push(String(applicantId));
      await exec(`UPDATE applicants SET ${fields.join(", ")} WHERE id = ?`, vals);
    }

   // Handle skills update if provided
    if (Array.isArray(body.skills)) {
      const names = [... new Set(
        body.skills.map(s => typeof s === "string" ? s : s?.name).filter(Boolean))];

    
      await exec(
        `DELETE FROM applicant_skills WHERE applicantID = ?`,[String(applicantId)]
      );

     
      for (const name of names) {
        const got = await exec(`SELECT id FROM skills WHERE name = ? LIMIT 1`, [name]);
        let skillId = got.length ? got[0].id : null;
        
        if (!skillId) {
            await exec('INSERT INTO skills (id, name) VALUES (UUID(), ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', [name]);
            const again = await exec(`SELECT id FROM skills WHERE name = ? LIMIT 1`, [name]);
            skillId = again[0].id;
        } 
        
        await exec(
          `INSERT INTO applicant_skills (id, applicantID, skillID)
           VALUES (UUID(), ?, ?)`,
          [String(applicantId), String(skillId)]
        );
      }
    }
    
    await exec("COMMIT");


    const applicants = await query(
        `SELECT id, name, email, location, password, experienceLevel
           FROM applicants
          WHERE id = ?`,
        [String(applicantId)]
    );

    if (!applicants.length) {
        conn.release();
        return createResponse(404, { error: "Applicant not found" });
    }
    const a = applicants[0];

    const skills = await query(
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
      password: a.password ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: skills.map(r => ({ name: r.name })),
    });

  } catch (err) {
    try { await exec('ROLLBACK'); } catch {}
    conn.release();
    throw err;
  }
  
} catch (err) {
    return handleError(err, 'Failed to update applicant profile');
  }
};