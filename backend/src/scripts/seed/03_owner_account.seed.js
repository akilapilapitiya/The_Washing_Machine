import { ensureOwnerAccount } from "../accounts/ownerAccount.js";

const seedOwnerAccount = async (client) => {
  console.log("👤 Ensuring owner account...");
  await ensureOwnerAccount({
    client,
    ownerOverrides: {
      first_name: "Ridma",
      last_name: "Jayasinghe",
      name_with_initials: "R. Jayasinghe",
      email: "owner@washingmachine.com",
      address_line1: "Pannipitiya Road",
      address_line2: "Maharagama",
      speciality: "System Management",
    },
  });
  console.log("✓ Owner account seed completed");
};

export default seedOwnerAccount;
