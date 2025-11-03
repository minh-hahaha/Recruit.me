const { v4: uuidv4 } = require('uuid');
const { query, getConnection, createResponse, handleError } = require('../shared/db-utils');

exports.handler = async (event) => {
    try {

    const body = JSON.parse(event.body || '{}');
    const { title, description, companyId, positions, skills, status } = body;

    // check inputs for all required fields
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
        await connection.beginTransaction();

        // create job

        const jobId = uuidv4();
        const createdAt = new Date();
        const jobStatus = status && ['Draft', 'Active', 'Closed'].includes(status) ? status : 'Draft';


        const jobSql = 'INSERT INTO jobs (id, title, description, companyId, status, positions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await connection.execute(jobSql, [
            jobId,
            title,
            description,
            companyId,
            jobStatus,
            positions || 1,
            createdAt,
            createdAt,
          ]);


        // insert job skills if provided
        if (skills && Array.isArray(skills) && skills.length > 0) {
            const skillSql = 'INSERT INTO job_skills (id, job_id, name) VALUES (?, ?, ?)';
            for (const skill of skills) {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              await connection.execute(skillSql, [uuidv4(), jobId, skillName]);
            }
          }
    
          await connection.commit();
    
          return createResponse(200, {
            id: jobId,
            createdAt: createdAt.toISOString(),
          });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
    } catch (error) {
    return handleError(error, 'Failed to create job');
    }
};