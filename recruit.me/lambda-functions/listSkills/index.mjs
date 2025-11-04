// listSkills.mjs
import { getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async () => {
  try {
    const conn = await getConnection();
    const exec = (sql, params=[]) => new Promise((res, rej) =>
      conn.query(sql, params, (err, rows) => err ? rej(err) : res(rows))
    );

    try {
      const skills = await exec(
        `SELECT id, name
           FROM skills
          ORDER BY name ASC`
      );
      return createResponse(200, skills);
    } finally {
      try { conn.release(); } catch {}
    }
  } catch (err) {
    return handleError(err, 'Failed to list skills');
  }
};
