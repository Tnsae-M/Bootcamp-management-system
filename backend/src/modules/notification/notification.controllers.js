import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const notifications = await notificationService.getUserNotifications(userId);
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const result = await notificationService.markAsReadAction(req.params.id, userId);
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
