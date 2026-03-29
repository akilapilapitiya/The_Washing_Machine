import pool from "../../configs/database.js";

const seedRoles = async (pool) => {
  const roles = [
    {
      rolename: "owner",
      role_description: "System owner with full access",
      is_admin: true,
    },
    {
      rolename: "manager",
      role_description: "Manager with administrative privileges",
      is_admin: false,
    },
    {
      rolename: "cashier",
      role_description: "Cashier for payment processing",
      is_admin: false,
    },
    {
      rolename: "employee",
      role_description: "Service employee",
      is_admin: false,
    },
    {
      rolename: "customer",
      role_description: "Customer account",
      is_admin: false,
    },
  ];

  console.log("📋 Seeding roles...");

  for (const role of roles) {
    await pool.query(
      `INSERT INTO role (rolename, role_description, is_admin) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (rolename) DO UPDATE SET
         role_description = EXCLUDED.role_description,
         is_admin = EXCLUDED.is_admin`,
      [role.rolename, role.role_description, role.is_admin], // Use default false for is_admin if not specified, but here we specify it.
    );
  }

  console.log("✓ Roles seeded successfully");
};

export default seedRoles;
