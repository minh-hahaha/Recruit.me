import { query, getConnection, createResponse, handleError } from './db-utils.mjs';

export const handler = async (event) => {
  const applicantId = event.pathParameters?.id;
  if (!applicantId) {
    return createResponse(400, { error: 'Missing applicant ID in path' });
  }

  const connection = await getConnection();

  try {

    // Load Applicant Core

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

    //  Load Skills

    const skills = await query(
        `SELECT s.name, aks.level
         FROM skills s
                JOIN applicant_skills aks ON aks.skillID = s.id
         WHERE aks.applicantID = ?
         ORDER BY s.name ASC`,
        [String(applicantId)]
    );


    // Load Applications for Profile

    const applications = await query(
        `SELECT
           app.id,
           app.jobID,
           app.status,
           app.offerStatus,
           app.appliedAt,
           app.withdrawnAt,
           j.title AS jobTitle,
           j.description AS jobDescription,
           j.companyID AS companyID,
           c.name AS companyName,
           c.location AS companyLocation
         FROM applications app
                JOIN jobs j ON j.id = app.jobID
                JOIN companies c ON c.id = j.companyID
         WHERE app.applicantID = ?
         ORDER BY app.appliedAt DESC`,
        [String(applicantId)]
    );

    const formattedApplications = applications.map(row => ({
      id: row.id,
      jobID: row.jobID,
      title: row.jobTitle,
      company: row.companyName,
      location: row.companyLocation ?? "",
      description: row.jobDescription ?? "",
      status: row.status,
      appliedOn: row.appliedAt,
      withdrawnOn: row.withdrawnAt,
      offerStatus: row.offerStatus,
    }));

    // Load Offers for right-hand "Job Offers" panel
    const offerRows = await query(
        `SELECT
           app.id,
           app.offerStatus,
           app.offeredAt,
           j.title          AS jobTitle,
           j.companyID      AS companyID,
           c.name           AS companyName,
           j.salary         AS jobSalary   -- if you want to show amount; optional
         FROM applications app
                JOIN jobs j      ON j.id = app.jobID
                JOIN companies c ON c.id = j.companyID
         WHERE app.applicantID = ?
           AND app.offerStatus <> 'None'
         ORDER BY app.offeredAt DESC`,
        [String(applicantId)]
    );

    const formattedOffers = offerRows.map(row => ({
      id: row.id,
      title: row.jobTitle,
      company: row.companyName,
      amount: row.jobSalary ?? "",
      offeredAt: row.offeredAt,
      status: row.offerStatus,       // "Pending" | "Accepted" | "Rejected" | "Rescinded"
    }));



    return createResponse(200, {
      id: a.id,
      name: a.name ?? "",
      password: a.password ?? "",
      email: a.email ?? "",
      location: a.location ?? "",
      experienceLevel: a.experienceLevel ?? "",
      skills: skills.map(r => ({ name: r.name, level: r.level ?? null })),
      applications: formattedApplications,
      offers: formattedOffers,
    });

  } catch (error) {
    console.error("get/applicants error:", error);
    return handleError(error, 'Failed to load applicant');
  } finally {
    connection.release();
  }
};
