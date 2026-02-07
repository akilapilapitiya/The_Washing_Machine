import pool from "../../src/configs/database.js";

const seedRoles = async (pool) => {
  const roles = [
    {
      roleid: 1,
      rolename: "owner",
      description: "System owner with full access",
    },
    {
      roleid: 2,
      rolename: "manager",
      description: "Manager with administrative privileges",
    },
    {
      roleid: 3,
      rolename: "cashier",
      description: "Cashier for payment processing",
    },
    { roleid: 4, rolename: "employee", description: "Service employee" },
    { roleid: 5, rolename: "customer", description: "Customer account" },
  ];

  console.log("📋 Seeding roles...");

  for (const role of roles) {
    await pool.query(
      `INSERT INTO role (roleid, rolename, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (roleid) DO NOTHING`,
      [role.roleid, role.rolename, role.description],
    );
  }

  console.log("✓ Roles seeded successfully");
};

export default seedRoles;
