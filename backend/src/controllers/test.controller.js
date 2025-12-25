import pool from "../configs/database.js";

export const databaseConnection = async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.status(201).json({
    message: `The database name is ${result.rows[0].current_database}`,
  });
};
