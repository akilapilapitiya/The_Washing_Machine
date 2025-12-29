import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";

async function addOwner() {
  console.log("Creating initial owner account...");

  const ownerData = {
    name: "System Owner",
    email: "owner@washingmachine.com",
    password: "Owner@123",
    telephone: "0771234567",
    type: "owner",
    nic: "200012345678",
  };

  try {
    // Check if owner already exists
    const existing = await pool.query(
      "SELECT empid FROM employee WHERE email = $1",
      [ownerData.email]
    );

    if (existing.rowCount > 0) {
      console.log(" Owner account already exists!");
      console.log(`Email: ${ownerData.email}`);
      console.log("No action taken.");
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(
      ownerData.password,
      Number(SALT_ROUNDS)
    );

    // Insert owner
    const result = await pool.query(
      `INSERT INTO employee (empname, email, emptel, password_hash, emptype, empnic)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING empid, empname, email, emptype`,
      [
        ownerData.name,
        ownerData.email,
        ownerData.telephone,
        passwordHash,
        ownerData.type,
        ownerData.nic,
      ]
    );

    const owner = result.rows[0];

    console.log("\n Owner account created successfully!");
    console.log("=====================================");
    console.log(`ID: ${owner.empid}`);
    console.log(`Name: ${owner.empname}`);
    console.log(`Email: ${owner.email}`);
    console.log(`Type: ${owner.emptype}`);
    console.log(`Password: ${ownerData.password}`);
    console.log("=====================================\n");
    console.log("Use these credentials to sign in and create other employees.");

    process.exit(0);
  } catch (err) {
    console.error(" Failed to create owner account:", err.message);
    process.exit(1);
  }
}

addOwner();
