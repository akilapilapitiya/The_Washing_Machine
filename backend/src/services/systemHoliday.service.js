import pool from "../configs/database.js";

// Get all holidays
export const getAllHolidays = async () => {
  const query = `
    SELECT 
      h.holidayid,
      h.holidayname,
      h.holidaydate::text as holidaydate,
      h.starttime::text as starttime,
      h.endtime::text as endtime,
      h.holidaytype,
      h.description,
      h.is_recurring,
      h.created_by,
      h.created_at,
      h.updated_at,
      e.first_name || ' ' || e.last_name as creator_name
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
      h.holidayid,
      h.holidayname,
      h.holidaydate::text as holidaydate,
      h.starttime::text as starttime,
      h.endtime::text as endtime,
      h.holidaytype,
      h.description,
      h.is_recurring,
      h.created_by,
      h.created_at,
      h.updated_at,
      e.first_name || ' ' || e.last_name as creator_name
    FROM system_holidays h
    LEFT JOIN employee e ON h.created_by = e.empid
    WHERE h.holidaydate BETWEEN $1 AND $2
    ORDER BY h.holidaydate ASC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

// Check if a specific date is a holiday (optionally overlapping with specific hours)
export const checkDateIsHoliday = async (date, startTime = null, endTime = null, excludeId = null) => {
  let query = `
    SELECT holidayid, holidayname, holidaytype, starttime::text, endtime::text
    FROM system_holidays
    WHERE holidaydate = $1
  `;
  const params = [date];
  let paramCount = 1;

  if (excludeId) {
    paramCount++;
    query += ` AND holidayid != $${paramCount}`;
    params.push(excludeId);
  }

  if (startTime && endTime) {
    query += `
      AND (
        starttime IS NULL OR endtime IS NULL
        OR NOT (endtime <= $${paramCount + 1}::time OR starttime >= $${paramCount + 2}::time)
      )
    `;
    params.push(startTime, endTime);
  }

  const result = await pool.query(query, params);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// Get holiday by ID
export const getHolidayById = async (holidayId) => {
  const query = `
    SELECT 
      h.holidayid,
      h.holidayname,
      h.holidaydate::text as holidaydate,
      h.starttime::text as starttime,
      h.endtime::text as endtime,
      h.holidaytype,
      h.description,
      h.is_recurring,
      h.created_by,
      h.created_at,
      h.updated_at,
      e.first_name || ' ' || e.last_name as creator_name
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
    starttime,
    endtime,
    holidaytype,
    description,
    is_recurring,
    created_by,
  } = holidayData;

  const query = `
    INSERT INTO system_holidays (
      holidayname, holidaydate, starttime, endtime, holidaytype, description, is_recurring, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    holidayname,
    holidaydate,
    starttime || null,
    endtime || null,
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
  const { holidayname, holidaydate, starttime, endtime, holidaytype, description, is_recurring } =
    holidayData;

  const query = `
    UPDATE system_holidays
    SET 
      holidayname = COALESCE($1, holidayname),
      holidaydate = COALESCE($2, holidaydate),
      starttime = $3,
      endtime = $4,
      holidaytype = COALESCE($5, holidaytype),
      description = COALESCE($6, description),
      is_recurring = COALESCE($7, is_recurring),
      updated_at = NOW()
    WHERE holidayid = $8
    RETURNING *
  `;

  const values = [
    holidayname,
    holidaydate,
    starttime || null,
    endtime || null,
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
    SELECT 
      holidayid,
      holidayname,
      holidaydate::text as holidaydate,
      starttime::text as starttime,
      endtime::text as endtime,
      holidaytype,
      description
    FROM system_holidays
    WHERE holidaydate >= CURRENT_DATE
    AND holidaydate <= CURRENT_DATE + INTERVAL '90 days'
    ORDER BY holidaydate ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Sync daily holidays (replace all custom holidays on a specific date)
export const syncDailyHolidays = async (date, blocks, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Delete existing custom holidays on this date
    await client.query(
      `DELETE FROM system_holidays WHERE holidaydate = $1 AND holidaytype = 'custom'`,
      [date]
    );

    // Insert new blocks
    for (const block of blocks) {
      await client.query(
        `INSERT INTO system_holidays (
          holidayname, holidaydate, starttime, endtime, holidaytype, created_by
        ) VALUES ($1, $2, $3, $4, 'custom', $5)`,
        ['Branch Closure', date, block.starttime, block.endtime, userId]
      );
    }
    
    await client.query("COMMIT");
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
