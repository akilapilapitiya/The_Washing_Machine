import bcrypt from "bcryptjs";
import pool from "../../configs/database.js";
import logger from "../../configs/logger.js";
import { SALT_ROUNDS } from "../../configs/env.js";

const DEFAULT_OWNER = {
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

const DEFAULT_DEPENDENT = {
  name: "Akila Pilapitiya",
  relationship: "Brother",
  contact_number: "0774532348",
};

const SALT = Number(SALT_ROUNDS ?? 10);

export async function ensureOwnerAccount({
  client = pool,
  ownerOverrides = {},
  dependentOverrides = {},
  includeDependent = true,
} = {}) {
  const ownerData = { ...DEFAULT_OWNER, ...ownerOverrides };
  const dependentData = { ...DEFAULT_DEPENDENT, ...dependentOverrides };

  const existingOwner = await client.query(
    "SELECT empid, first_name, last_name, email, emptype FROM employee WHERE email = $1 OR emptype = 'owner' LIMIT 1",
    [ownerData.email],
  );

  if (existingOwner.rowCount > 0) {
    logger.info("Owner account already exists. Skipping creation.");
    return {
      created: false,
      owner: existingOwner.rows[0],
      password: ownerData.password,
    };
  }

  const passwordHash = await bcrypt.hash(ownerData.password, SALT);

  const insertedOwner = await client.query(
    `INSERT INTO employee (
       first_name, last_name, name_with_initials, email, emptel,
       password_hash, emptype, empnic, address_number, address_line1,
       address_line2, dob, speciality, roleid
     )
     VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10,
       $11, $12, $13, (SELECT roleid FROM role WHERE rolename = 'owner')
     )
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

  const owner = insertedOwner.rows[0];

  if (includeDependent) {
    await client.query(
      `INSERT INTO employee_dependent (empid, name, relationship, contact_number, is_emergency_contact)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [
        owner.empid,
        dependentData.name,
        dependentData.relationship,
        dependentData.contact_number,
      ],
    );
  }

  return { created: true, owner, password: ownerData.password };
}
