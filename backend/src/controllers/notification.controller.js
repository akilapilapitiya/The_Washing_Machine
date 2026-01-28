import * as notificationService from "../services/notification.service.js";
import { successResponse } from "../utils/response.util.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const notifications = await notificationService.getUserNotificationsService(
      id,
      role,
    );
    successResponse(res, 200, "Notifications retrieved", { notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id: notificationId } = req.params;
    const { id: userId } = req.user;
    await notificationService.markNotificationAsReadService(
      notificationId,
      userId,
    );
    successResponse(res, 200, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    await notificationService.markAllAsReadService(id, role);
    successResponse(res, 200, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};
