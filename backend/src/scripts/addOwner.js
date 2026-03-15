import logger from '../configs/logger.js';
import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";

async function addOwner() {
  logger.info("Creating initial owner account...");

  const ownerData = {
    first_name: "Ridma",
    last_name: "Jayasinghe",
    name_with_initials: "R. Jayasinghe",
    email: "owner@washingmachine.com",
    password: "Owner@123",
    telephone: "0771234567",
    type: "owner",
    nic: "200012345678",
    address_number: "100",
    address_line1: "Pannipitiya Road",
    address_line2: "Maharagama",
    dob: "1990-11-29",
    speciality: "System Management",
  };

  const ownerDependentData = {
    name: "Akila Pilapitiya",
    relationship: "Brother",
    contact_number: "0774532348",
  };

  try {
    // Check if owner already exists
    const existing = await pool.query(
      "SELECT empid FROM employee WHERE email = $1",
      [ownerData.email],
    );

    if (existing.rowCount > 0) {
      logger.info(" Owner account already exists!");
      logger.info(`Email: ${ownerData.email}`);
      logger.info("No action taken.");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      ownerData.password,
      Number(SALT_ROUNDS),
    );

    // Insert owner
    const result = await pool.query(
      `INSERT INTO employee (
         first_name, last_name, name_with_initials, email, emptel, 
         password_hash, emptype, empnic, address_number, address_line1, address_line2, dob, speciality, roleid
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, (SELECT roleid FROM role WHERE rolename = 'owner'))
       RETURNING empid, first_name, last_name, email, emptype`,
      [
        ownerData.first_name,
        ownerData.last_name,
        ownerData.name_with_initials,
        ownerData.email,
        ownerData.telephone,
        passwordHash,
        ownerData.type,
        ownerData.nic,
        ownerData.address_number,
        ownerData.address_line1,
        ownerData.address_line2,
        ownerData.dob,
        ownerData.speciality,
      ],
    );

    const owner = result.rows[0];

    // Seed owner dependent
    await pool.query(
      `INSERT INTO employee_dependent (empid, name, relationship, contact_number, is_emergency_contact)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [
        owner.empid,
        ownerDependentData.name,
        ownerDependentData.relationship,
        ownerDependentData.contact_number,
      ],
    );

    logger.info("\n Owner account and dependent created successfully!");
    logger.info("=====================================");
    logger.info(`ID: ${owner.empid}`);
    logger.info(`Name: ${owner.first_name} ${owner.last_name}`);
    logger.info(`Email: ${owner.email}`);
    logger.info(`Type: ${owner.emptype}`);
    logger.info(`Password: ${ownerData.password}`);
    logger.info("=====================================\n");
    logger.info("Use these credentials to sign in and create other employees.");
  } catch (err) {
    logger.error(" Failed to create owner account:", err.message);
    throw err;
  }
}

export const seedOwnerAccount = addOwner;

// Run directly if executed as script
async function main() {
  try {
    await addOwner();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

if (process.argv[1].includes("addOwner.js")) {
  main();
}
