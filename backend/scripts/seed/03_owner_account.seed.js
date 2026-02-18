import pool from "../../src/configs/database.js";
import bcrypt from "bcryptjs";

const seedOwnerAccount = async (pool) => {
  console.log("👤 Seeding owner account...");

  // Check if owner already exists
  const existingOwner = await pool.query(
    "SELECT empid FROM employee WHERE roleid = 1 OR emptype = 'owner'",
  );

  if (existingOwner.rowCount > 0) {
    console.log("⚠️  Owner account already exists, skipping...");
    return;
  }

  // Hash the default password
  const hashedPassword = await bcrypt.hash("Owner@123", 10);

  // Get owner role ID dynamically
  const ownerRoleRes = await pool.query("SELECT roleid FROM role WHERE rolename = 'owner'");
  const ownerRoleId = ownerRoleRes.rows[0]?.roleid;

  if (!ownerRoleId) {
    throw new Error("❌ Owner role not found! Please ensure roles are seeded first.");
  }

  const owner = {
    first_name: "System",
    last_name: "Owner",
    name_with_initials: "S. Owner",
    email: "owner@washingmachine.lk",
    password_hash: hashedPassword,
    emptel: "0771234567",
    empnic: "199012345678",
    address_number: "100",
    address_line1: "Main Street",
    address_line2: "Colombo",
    emptype: "owner",
    roleid: ownerRoleId,
    dob: "1990-01-01",
    speciality: "System Administration",
  };

  try {
    const result = await pool.query(
      `INSERT INTO employee (
        first_name, last_name, name_with_initials, email, password_hash, 
        emptel, empnic, address_number, address_line1, address_line2, 
        emptype, roleid, dob, speciality
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING empid`,
      [
        owner.first_name,
        owner.last_name,
        owner.name_with_initials,
        owner.email,
        owner.password_hash,
        owner.emptel,
        owner.empnic,
        owner.address_number,
        owner.address_line1,
        owner.address_line2,
        owner.emptype,
        owner.roleid,
        owner.dob,
        owner.speciality,
      ],
    );

    console.log("✓ Owner account created successfully");
    console.log(`  ID: ${result.rows[0].empid}`);
    console.log("  Email: owner@washingmachine.lk");
    console.log("  Password: Owner@123");
  } catch (error) {
    console.error("❌ Failed to seed owner:", error.message);
    throw error;
  }
};

export default seedOwnerAccount;
