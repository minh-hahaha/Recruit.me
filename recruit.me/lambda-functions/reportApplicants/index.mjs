import { query, getConnection, createResponse, handleError } from "./db-utils.mjs";

export const handler = async (event) => {
  const page = parseInt(event.queryStringParameters?.page || "1", 10);
  const pageSize = parseInt(event.queryStringParameters?.pageSize || "10", 10);
  const limit = Math.max(1, Math.min(pageSize, 50)); // cap page size
  const offset = (page - 1) * limit;

  const connection = await getConnection();

  try {
    // 1) paginated rows
    const rows = await query(
      `SELECT 
         a.id,
         a.name,
         a.email,
         COUNT(DISTINCT app.jobID) AS jobsApplied,
         SUM(CASE WHEN app.offerStatus = 'Accepted' THEN 1 ELSE 0 END) AS jobsAccepted,
         SUM(CASE WHEN app.status = 'Withdrawn' THEN 1 ELSE 0 END) AS jobsWithdrawn
       FROM applicants a
       LEFT JOIN applications app ON app.applicantID = a.id
       GROUP BY a.id, a.name, a.email
       ORDER BY a.name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // 2) total applicants for pagination
    const totalResult = await query(
      `SELECT COUNT(*) AS totalApplicants FROM applicants`
    );
    const totalApplicants = totalResult[0]?.totalApplicants ?? 0;

    return createResponse(200, {
      page,
      pageSize: limit,
      totalApplicants,
      applicants: rows.map((r) => ({
        id: r.id,
        name: r.name ?? "",
        email: r.email ?? "",
        jobsApplied: r.jobsApplied ?? 0,
        jobsAccepted: r.jobsAccepted ?? 0,
        jobsWithdrawn: r.jobsWithdrawn ?? 0,
      })),
    });
  } catch (error) {
    console.error("reportApplicants error:", error);
    return handleError(error, "Failed to load applicant report");
  } finally {
    connection.release();
  }
};
