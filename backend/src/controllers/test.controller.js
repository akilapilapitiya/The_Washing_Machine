export const databaseConnection = async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`The database name is ${result.rows[0].current_database}`);
};