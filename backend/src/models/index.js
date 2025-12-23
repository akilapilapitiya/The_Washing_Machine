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

    console.log("All tables initialized");
  } catch (error) {
    console.error("Model initialization failed:", error.message);
  }
};

export default initModels;
