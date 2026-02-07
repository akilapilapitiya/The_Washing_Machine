import pool from "../configs/database.js";

// Get all holidays
export const getAllHolidays = async () => {
  const query = `
    SELECT 
      h.*,
      e.empname as creator_name
    FROM system_holidays h
    LEFT JOIN employee e ON h.created_by = e.empid
    ORDER BY h.holidaydate ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get holidays by date range
export const getHolidaysByDateRange = async (startDate, endDate) => {
  const query = `
    SELECT 
      h.*,
      e.empname as creator_name
    FROM system_holidays h
    LEFT JOIN employee e ON h.created_by = e.empid
    WHERE h.holidaydate BETWEEN $1 AND $2
    ORDER BY h.holidaydate ASC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

// Check if a specific date is a holiday
export const checkDateIsHoliday = async (date) => {
  const query = `
    SELECT holidayid, holidayname, holidaytype
    FROM system_holidays
    WHERE holidaydate = $1
  `;
  const result = await pool.query(query, [date]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// Get holiday by ID
export const getHolidayById = async (holidayId) => {
  const query = `
    SELECT 
      h.*,
      e.empname as creator_name
    FROM system_holidays h
    LEFT JOIN employee e ON h.created_by = e.empid
    WHERE h.holidayid = $1
  `;
  const result = await pool.query(query, [holidayId]);
  return result.rows[0];
};

// Create new holiday
export const createHoliday = async (holidayData) => {
  const {
    holidayname,
    holidaydate,
    holidaytype,
    description,
    is_recurring,
    created_by,
  } = holidayData;

  const query = `
    INSERT INTO system_holidays (
      holidayname, holidaydate, holidaytype, description, is_recurring, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    holidayname,
    holidaydate,
    holidaytype || "public",
    description || null,
    is_recurring || false,
    created_by,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update holiday
export const updateHoliday = async (holidayId, holidayData) => {
  const { holidayname, holidaydate, holidaytype, description, is_recurring } =
    holidayData;

  const query = `
    UPDATE system_holidays
    SET 
      holidayname = COALESCE($1, holidayname),
      holidaydate = COALESCE($2, holidaydate),
      holidaytype = COALESCE($3, holidaytype),
      description = COALESCE($4, description),
      is_recurring = COALESCE($5, is_recurring),
      updated_at = NOW()
    WHERE holidayid = $6
    RETURNING *
  `;

  const values = [
    holidayname,
    holidaydate,
    holidaytype,
    description,
    is_recurring,
    holidayId,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete holiday
export const deleteHoliday = async (holidayId) => {
  const query = `
    DELETE FROM system_holidays
    WHERE holidayid = $1
    RETURNING *
  `;
  const result = await pool.query(query, [holidayId]);
  return result.rows[0];
};

// Get upcoming holidays (next 90 days)
export const getUpcomingHolidays = async () => {
  const query = `
    SELECT *
    FROM system_holidays
    WHERE holidaydate >= CURRENT_DATE
    AND holidaydate <= CURRENT_DATE + INTERVAL '90 days'
    ORDER BY holidaydate ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
