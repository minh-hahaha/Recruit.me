import { v4 as uuidv4 } from 'uuid';
import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Parsed body:', body);
    const { title, description, companyId, positions, skills, status } = body;

    // Validate inputs
    if (!title || title.trim() === '') {
      return createResponse(400, { error: 'Title is required' });
    }
    if (!description || description.trim() === '') {
      return createResponse(400, { error: 'Description is required' });
    }
    if (!companyId || companyId.trim() === '') {
      return createResponse(400, { error: 'Invalid company ID' });
    }

    // Verify company exists
    const companySql = 'SELECT id FROM companies WHERE id = ?';
    const companies = await query(companySql, [companyId]);
    if (companies.length === 0) {
      return createResponse(400, { error: 'Invalid company ID' });
    }

    const connection = await getConnection();

    try {
      await query('START TRANSACTION');

      const jobId = uuidv4();
      const createdAt = new Date();
      const jobStatus = status && ['Draft', 'Active', 'Closed'].includes(status)
        ? status
        : 'Draft';

      // Insert job
      const jobSql = `
        INSERT INTO jobs (id, title, description, companyID, status, positions, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await query(jobSql, [jobId, title, description, companyId, jobStatus, positions || 1, createdAt]);

      // Insert skills if provided
      if (skills && Array.isArray(skills) && skills.length > 0) {
        for (const skill of skills) {
          const skillName = typeof skill === 'string' ? skill : skill.name;

          // Check if skill exists
          const existingSkill = await query('SELECT id FROM skills WHERE name = ?', [skillName]);
          let skillId;

          if (existingSkill.length === 0) {
            skillId = uuidv4();
            await query('INSERT INTO skills (id, name) VALUES (?, ?)', [skillId, skillName]);
          } else {
            skillId = existingSkill[0].id;
          }

          // Link job and skill
          await query(
            'INSERT INTO job_skills (id, jobID, skillID) VALUES (?, ?, ?)',
            [uuidv4(), jobId, skillId]
          );
        }
      }

      await query('COMMIT');

      console.log('Job created with ID:', jobId);


      return createResponse(200, {
        id: jobId,
        createdAt: createdAt.toISOString(),
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    return handleError(error, 'Failed to create job');
  }
};
