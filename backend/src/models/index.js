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
import createNotificationTable from "./notification.model.js";
import createIncidentTable from "./incident.model.js";
import createVehicleCatalogTable from "./vehicleCatalog.model.js";

const initModels = async (pool) => {
  try {
    console.log("Initializing database tables...");

    // Create all tables
    await createCustomerTable(pool);
    await createRoleTable(pool);
    await createEmployeeTable(pool);
    await createVehicleCatalogTable(pool); // Before vehicle table for potential references
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
    await createNotificationTable(pool);
    await createIncidentTable(pool); // After all referenced tables

    console.log("✓ All database tables created successfully");
  } catch (error) {
    console.error("✗ Model initialization failed:", error.message);
    console.error("Full error:", error);
    throw error; // Re-throw to see full stack trace
  }
};

export default initModels;
