import { query, getConnection, createResponse, handleError } from "./db-utils.mjs";

export const handler = async (event) => {
  const page = parseInt(event.queryStringParameters?.page || "1", 10);
  const pageSize = parseInt(event.queryStringParameters?.pageSize || "10", 10);
  const limit = Math.max(1, Math.min(pageSize, 50)); // cap page size
  const offset = (page - 1) * limit;

  const connection = await getConnection();

  try {
    // 1) Get paginated companies with aggregated stats
    const companyRows = await query(
      `SELECT 
         c.id,
         c.name,
         COUNT(DISTINCT CASE WHEN app.offerStatus IN ('Pending', 'Accepted') THEN app.id END) AS offersCount,
         COUNT(DISTINCT CASE WHEN app.offerStatus = 'Accepted' THEN app.id END) AS hiredCount,
         COUNT(DISTINCT CASE WHEN app.status = 'Withdrawn' THEN app.id END) AS withdrawnCount
       FROM companies c
       LEFT JOIN applications app ON app.companyID = c.id
       GROUP BY c.id, c.name
       ORDER BY c.name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // 2) For each company, get all their jobs with applicant counts
    const companiesWithJobs = await Promise.all(
      companyRows.map(async (company) => {
        const jobs = await query(
          `SELECT 
             j.id,
             j.title,
             j.status,
             j.positions,
             COUNT(DISTINCT app.id) AS applicantCount,
             COUNT(DISTINCT CASE WHEN app.offerStatus = 'Accepted' THEN app.id END) AS hiredCount
           FROM jobs j
           LEFT JOIN applications app ON app.jobID = j.id
           WHERE j.companyID = ?
           GROUP BY j.id, j.title, j.status, j.positions
           ORDER BY j.createdAt DESC`,
          [company.id]
        );

        return {
          id: company.id,
          name: company.name ?? "",
          offersCount: company.offersCount ?? 0,
          hiredCount: company.hiredCount ?? 0,
          withdrawnCount: company.withdrawnCount ?? 0,
          jobs: jobs.map((j) => ({
            id: j.id,
            title: j.title ?? "",
            status: j.status ?? "Draft",
            isOpen: j.status === "Active",
            positions: j.positions ?? 0,
            applicantCount: j.applicantCount ?? 0,
            hiredCount: j.hiredCount ?? 0,
          })),
        };
      })
    );

    // 3) Get total companies for pagination
    const totalResult = await query(`SELECT COUNT(*) AS totalCompanies FROM companies`);
    const totalCompanies = totalResult[0]?.totalCompanies ?? 0;

    return createResponse(200, {
      page,
      pageSize: limit,
      totalCompanies,
      companies: companiesWithJobs,
    });
  } catch (error) {
    console.error("reportJobs error:", error);
    return handleError(error, "Failed to load jobs report");
  } finally {
    connection.release();
  }
};
