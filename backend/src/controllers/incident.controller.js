import pool from "../configs/database.js";
import { successResponse } from "../utils/response.util.js";
import { assertRequiredFields } from "../utils/validation.util.js";

// Create Incident (Employee)
export const createIncident = async (req, res, next) => {
  try {
    const { customerId, bookingId, description, severity } = req.body;
    const employeeId = req.user.id;

    assertRequiredFields({ description }, ["description"]);

    const result = await pool.query(
      `INSERT INTO incident (employee_id, customer_id, booking_id, description, severity, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [
        employeeId,
        customerId || null,
        bookingId || null,
        description,
        severity || "medium",
      ],
    );

    successResponse(
      res,
      201,
      "Incident reported successfully. Access control notified.",
      result.rows[0],
    );
  } catch (error) {
    next(error);
  }
};

// Get Incidents (Role-Based)
export const getIncidents = async (req, res, next) => {
  try {
    const userRole = req.user.emptype || req.user.role;
    let query = `
      SELECT 
        i.*,
        TRIM(CONCAT_WS(' ', c.title, c.first_name, c.last_name)) as customer_name,
        c.cusemail as customer_email,
        e.first_name || ' ' || e.last_name as employee_name
      FROM incident i
      LEFT JOIN customer c ON i.customer_id = c.cusid
      LEFT JOIN employee e ON i.employee_id = e.empid
    `;
    const params = [];

    // If not owner/manager/cashier, only show their own incidents
    if (userRole !== "owner" && userRole !== "cashier" && userRole !== "manager") {
      query += ` WHERE i.employee_id = $1`;
      params.push(req.user.id);
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(query, params);

    successResponse(res, 200, "Incidents retrieved", result.rows);
  } catch (error) {
    next(error);
  }
};

// Update Incident Status (Owner)
export const updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE incident SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id],
    );

    successResponse(res, 200, "Incident status updated", result.rows[0]);
  } catch (error) {
    next(error);
  }
};
