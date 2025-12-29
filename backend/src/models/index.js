import createBookingTable from "./booking.model.js";
import createCustomerTable from "./customer.model.js";
import createEmployeeTable from "./employee.model.js";
import createEmployeeAssignedTable from "./employeeAssigned.model.js";
import createEmployeeLeaveTable from "./employeeLeave.model.js";
import createEmployeePreferenceTable from "./employeepreference.model.js";
import createFeedbackTable from "./feedback.model.js";
import createPaymentTable from "./payment.model.js";
import createScheduleTable from "./schedule.model.js";
import createServiceTable from "./service.model.js";
import createServicesBookedTable from "./servicesBooked.model.js";
import createVehicleTable from "./vehicle.model.js";

const initModels = async (pool) => {
  try {
    // Check if tables already exist
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer'
      );
    `;
    const result = await pool.query(checkQuery);
    const tablesExist = result.rows[0].exists;

    if (tablesExist) {
      console.log("✓ Database tables already initialized");
      return;
    }

    // Create all tables
    await createCustomerTable(pool);
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
