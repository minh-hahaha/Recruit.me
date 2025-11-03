import { v4 as uuidv4 } from 'uuid';
import { getConnection, createResponse, handleError } from './db-utils.mjs';

// Helper function to query on a specific connection
function queryOnConnection(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

export const handler = async (event) => {
  let connection;
  
  try {
    const body = JSON.parse(event.body || '{}');
    const { id, title, description, positions, skills, status } = body;

    if (!id || id.trim() === '') {
      return createResponse(400, { error: 'Job ID is required' });
    }

    connection = await getConnection();

    try {
      await queryOnConnection(connection, 'START TRANSACTION');

      // Check if job exists
      const existingJobs = await queryOnConnection(connection, 'SELECT id FROM jobs WHERE id = ?', [id]);
      if (existingJobs.length === 0) {
        await queryOnConnection(connection, 'ROLLBACK');
        return createResponse(400, { error: 'Job not found' });
      }

      // Update job fields if provided
      const updateFields = [];
      const updateValues = [];

      if (title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (positions !== undefined) {
        updateFields.push('positions = ?');
        updateValues.push(positions);
      }
      if (status !== undefined && ['Draft', 'Active', 'Closed'].includes(status)) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date());
        updateValues.push(id);
        const updateSql = `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryOnConnection(connection, updateSql, updateValues);
      }

      // Update job skills if provided
      if (skills !== undefined && Array.isArray(skills)) {
        await queryOnConnection(connection, 'DELETE FROM job_skills WHERE jobID = ?', [id]);

        if (skills.length > 0) {
          for (const skill of skills) {
            const skillName = typeof skill === 'string' ? skill : skill.name;

            // Ensure skill exists in the skills table
            let skillRows = await queryOnConnection(connection, 'SELECT id FROM skills WHERE name = ?', [skillName]);
            let skillID;

            if (skillRows.length === 0) {
              skillID = uuidv4();
              await queryOnConnection(connection, 'INSERT INTO skills (id, name) VALUES (?, ?)', [skillID, skillName]);
            } else {
              skillID = skillRows[0].id;
            }

            await queryOnConnection(connection, 
              'INSERT INTO job_skills (id, jobID, skillID) VALUES (?, ?, ?)',
              [uuidv4(), id, skillID]
            );
          }
        }
      }

      await queryOnConnection(connection, 'COMMIT');

      // Fetch updated job details
      const updatedJob = await queryOnConnection(connection, 'SELECT * FROM jobs WHERE id = ?', [id]);
      const job = updatedJob[0] || {};

      return createResponse(200, {
        id: job.id,
        updatedAt: job.updatedAt,
      });

    } catch (error) {
      await queryOnConnection(connection, 'ROLLBACK');
      throw error;
    }

  } catch (error) {
    return handleError(error, 'Failed to edit job');
  } finally {
    if (connection) {
      connection.release();
    }
  }
};