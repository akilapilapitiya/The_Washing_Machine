import pool from "../../src/configs/database.js";
import bcrypt from "bcrypt";

const seedOwnerAccount = async (pool) => {
  console.log("👤 Seeding owner account...");

  // Check if owner already exists
  const existingOwner = await pool.query(
    "SELECT empid FROM employee WHERE empid = 1",
  );

  if (existingOwner.rowCount > 0) {
    console.log("⚠️  Owner account already exists, skipping...");
    return;
  }

  // Hash the default password
  const hashedPassword = await bcrypt.hash("Owner@123", 10);

  const owner = {
    empid: 1,
    first_name: "System",
    last_name: "Owner",
    email: "owner@washingmachine.lk",
    password: hashedPassword,
    phone: "+94771234567",
    nic: "199012345678",
    address: "Pannipitiya, Sri Lanka",
    emptype: "owner",
    role_id: 1,
    is_active: true,
  };

  await pool.query(
    `INSERT INTO employee (
      empid, first_name, last_name, email, password, phone, nic, 
      address, emptype, role_id, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      owner.empid,
      owner.first_name,
      owner.last_name,
      owner.email,
      owner.password,
      owner.phone,
      owner.nic,
      owner.address,
      owner.emptype,
      owner.role_id,
      owner.is_active,
    ],
  );

  console.log("✓ Owner account created successfully");
  console.log("  Email: owner@washingmachine.lk");
  console.log("  Password: Owner@123");
};

export default seedOwnerAccount;
