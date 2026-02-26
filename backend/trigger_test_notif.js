import { createNotificationService } from "./src/services/notification.service.js";
import pool from "./src/configs/database.js";

async function testNotification() {
  try {
    console.log("Triggering test notification for Employee ID 2...");
    await createNotificationService({
      recipientId: 2,
      recipientRole: "employee",
      title: "Debug Test",
      message: "This is a direct test from the debug script.",
      type: "info"
    });
    console.log("Notification service call completed.");
    // Wait a bit for the async import/sendMessage in notification service
    setTimeout(() => process.exit(0), 2000);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testNotification();
