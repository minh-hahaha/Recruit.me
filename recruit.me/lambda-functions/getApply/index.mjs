
import { query, getConnection, createResponse, handleError } from "./db-utils.mjs";

export const handler = async (event) => {
  const jobId = event.pathParameters?.id;
  if (!jobId) {
    return createResponse(400, { error: "Missing job ID in path" });
  }

  const connection = await getConnection();

  try {
    const rows = await query(
      `SELECT 
         j.id,
         j.title,
         j.description,
         j.location,
         j.salary,
         j.companyID,
         c.name AS companyName
       FROM jobs j
       JOIN companies c ON c.id = j.companyID
       WHERE j.id = ?`,
      [String(jobId)]
    );

    if (rows.length === 0) {
      return createResponse(404, { error: "Job not found" });
    }

    const j = rows[0];

    return createResponse(200, {
      id: j.id,
      title: j.title ?? "",
      description: j.description ?? "",
      location: j.location ?? "",
      salary: j.salary ?? "",
      company: j.companyName ?? "",
      companyID: j.companyID ?? "",
    });
  } catch (error) {
    console.error("get/job error:", error);
    return handleError(error, "Failed to load job");
  } finally {
    connection.release();
  }
};
