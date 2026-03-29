import logger from "../../configs/logger.js";
import { ensureOwnerAccount } from "./ownerAccount.js";

async function addOwner() {
  logger.info("Creating initial owner account...");
  try {
    const { created, owner, password } = await ensureOwnerAccount();

    if (!created) {
      logger.info("Owner account already exists. No action taken.");
      logger.info(`Email: ${owner.email}`);
      return;
    }

    logger.info("\nOwner account and dependent created successfully!");
    logger.info("=====================================");
    logger.info(`ID: ${owner.empid}`);
    logger.info(`Name: ${owner.first_name} ${owner.last_name}`);
    logger.info(`Email: ${owner.email}`);
    logger.info(`Type: ${owner.emptype}`);
    logger.info(`Password: ${password}`);
    logger.info("=====================================\n");
    logger.info("Use these credentials to sign in and create other employees.");
  } catch (err) {
    logger.error("Failed to create owner account:", err.message);
    throw err;
  }
}

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
