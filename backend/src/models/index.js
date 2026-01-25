import createBookingTable from "./booking.model.js";
import createCustomerTable from "./customer.model.js";
import createEmployeeTable from "./employee.model.js";
import createEmployeeAssignedTable from "./employeeAssigned.model.js";
import createEmployeeLeaveTable from "./employeeLeave.model.js";
import createEmployeePreferenceTable from "./employeePreference.model.js";
import createFeedbackTable from "./feedback.model.js";
import createPaymentTable from "./payment.model.js";
import createScheduleTable from "./schedule.model.js";
import createServiceTable from "./service.model.js";
import createServicesBookedTable from "./servicesBooked.model.js";
import createVehicleTable from "./vehicle.model.js";
import createRoleTable from "./role.model.js";

const initModels = async (pool) => {
  try {
    console.log("Initializing database tables...");

    // Create all tables
    await createCustomerTable(pool);
    await createRoleTable(pool);
    await createEmployeeTable(pool);
    await createVehicleTable(pool);
    await createServiceTable(pool);
    await createBookingTable(pool);
    await createEmployeeLeaveTable(pool);
    await createScheduleTable(pool);
    await createPaymentTable(pool);
    await createFeedbackTable(pool);
    await createServicesBookedTable(pool);
    await createEmployeePreferenceTable(pool);
    await createEmployeeAssignedTable(pool);

    console.log("✓ All database tables created successfully");
  } catch (error) {
    console.error("✗ Model initialization failed:", error.message);
  }
};

export default initModels;
