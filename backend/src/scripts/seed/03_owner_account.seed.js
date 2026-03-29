import { ensureOwnerAccount } from "../accounts/ownerAccount.js";

const seedOwnerAccount = async (client) => {
  console.log("👤 Ensuring owner account...");
  await ensureOwnerAccount({
    client,
    ownerOverrides: {
      first_name: "System",
      last_name: "Owner",
      name_with_initials: "S. Owner",
      email: "owner@washingmachine.lk",
      address_line1: "Main Street",
      address_line2: "Colombo",
      speciality: "System Administration",
    },
  });
  console.log("✓ Owner account seed completed");
};

export default seedOwnerAccount;
