import crypto from "crypto";
import { query, getConnection, createResponse, handleError } from "./db-utils.mjs";

export const handler = async (event) => {
  const connection = await getConnection();

  try {
    if (!event.body) {
      return createResponse(400, { error: "Missing request body" });
    }

    const body = JSON.parse(event.body);
    const { applicantID, jobID } = body;

    if (!applicantID || !jobID) {
      return createResponse(400, { error: "Missing applicantID or jobID" });
    }

    const applicants = await query(
      `SELECT id FROM applicants WHERE id = ?`,
      [String(applicantID)]
    );
    if (applicants.length === 0) {
      return createResponse(404, { error: "Applicant not found" });
    }

    const jobs = await query(
      `SELECT id, companyID FROM jobs WHERE id = ?`,
      [String(jobID)]
    );
    if (jobs.length === 0) {
      return createResponse(404, { error: "Job not found" });
    }

    const companyID = jobs[0].companyID;

   
    const applicationID = crypto.randomUUID();

    await query(
      `INSERT INTO applications (
        id,
        applicantID,
        jobID,
        companyID,
        status,
        rating,
        offerStatus,
        appliedAt,
        withdrawnAt,
        offeredAt,
        respondedAt,
        createdAt,
        updatedAt
      ) VALUES (
        ?, ?, ?, ?, 'Applied', NULL, 'None', NOW(), NULL, NULL, NULL, NOW(), NOW()
      )`,
      [
        applicationID,
        String(applicantID),
        String(jobID),
        String(companyID),
      ]
    );


    const rows = await query(
      `SELECT
         id,
         applicantID,
         jobID,
         companyID,
         status,
         rating,
         offerStatus,
         appliedAt,
         withdrawnAt,
         offeredAt,
         respondedAt,
         createdAt,
         updatedAt
       FROM applications
       WHERE id = ?`,
      [applicationID]
    );

    const application = rows[0];

    return createResponse(201, {
      message: "Application created successfully",
      application,
    });

  } catch (error) {
    console.error("applications/apply error:", error);
    return handleError(error, "Failed to create application");
  } finally {
    connection.release();
  }
};
