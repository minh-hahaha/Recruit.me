const { v4: uuidv4 } = require('uuid');
const { query, getConnection, createResponse, handleError } = require('./db-utils.js');


exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { id, title, description, positions, skills, status } = body;

        // check inputs for all required fields
        if (!id || id.trim() === '') {
            return createResponse(400, { error: 'Job ID is required' });
        }

        const connection = await getConnection();

        try {
            await connection.beginTransaction();

            // check if job exists
            const [existingJobs] = await query('SELECT id FROM jobs WHERE id = ?', [id]);

            if(existingJobs.length === 0) {
                await connection.rollback();
                return createResponse(400, { error: 'Job not found' });
            }

            // if found, update job fields
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
                await connection.execute(updateSql, updateValues);
              }
            
            // update job skills if provided
            if (skills !== undefined && Array.isArray(skills)) {
                // Delete existing skills
                await connection.execute('DELETE FROM job_skills WHERE job_id = ?', [id]);
        
                // Insert new skills
                if (skills.length > 0) {
                  const insertSql = 'INSERT INTO job_skills (id, job_id, name) VALUES (?, ?, ?)';
                  for (const skill of skills) {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    await connection.execute(insertSql, [uuidv4(), id, skillName]);
                  }
                }
              }
            
            await connection.commit();


            // fetch updated job details
            const [updatedJob] = await connection.execute('SELECT * FROM jobs WHERE id = ?', [id]);
            const [jobSkills] = await query('SELECT skill_id FROM job_skills WHERE job_id = ?', [id]);

            const job = updatedJob[0]
            return createResponse(200, {
                id: job.id,
                // can add more fields here if needed
                updatedAt: job.updated_at
              });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        return handleError(error, 'Failed to edit job');
    }
}