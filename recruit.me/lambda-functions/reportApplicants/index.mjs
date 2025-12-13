import { query, getConnection, createResponse, handleError } from "./db-utils.mjs";

function getQueryParam(event, key) {
  if (event?.queryStringParameters?.[key] != null) return event.queryStringParameters[key];

  const mv = event?.multiValueQueryStringParameters?.[key];
  if (Array.isArray(mv) && mv.length) return mv[0];

  if (typeof event?.rawQueryString === "string" && event.rawQueryString.length) {
    const usp = new URLSearchParams(event.rawQueryString);
    const v = usp.get(key);
    if (v != null) return v;
  }

  return null;
}

export const handler = async (event) => {
  const pageRaw = getQueryParam(event, "page") ?? "1";
  const pageSizeRaw = getQueryParam(event, "pageSize") ?? "10";

  const page = parseInt(pageRaw, 10) || 1;
  const pageSize = parseInt(pageSizeRaw, 10) || 10;

  const limit = Math.max(1, Math.min(pageSize, 50));
  const offset = (page - 1) * limit;

  const connection = await getConnection();

  try {
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

    const totalResult = await query(`SELECT COUNT(*) AS totalApplicants FROM applicants`);
    const totalApplicants = Number(totalResult[0]?.totalApplicants) || 0;

    return createResponse(200, {
      page,
      pageSize: limit,
      totalApplicants,
      applicants: rows.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        email: String(r.email ?? ""),
        jobsApplied: Number(r.jobsApplied) || 0,
        jobsAccepted: Number(r.jobsAccepted) || 0,
        jobsWithdrawn: Number(r.jobsWithdrawn) || 0,
      })),
    });
  } catch (error) {
    console.error("reportApplicants error:", error);
    return handleError(error, "Failed to load applicant report");
  } finally {
    connection.release();
  }
};
