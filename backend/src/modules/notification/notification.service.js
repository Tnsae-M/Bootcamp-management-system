// Notifications Service - BMS Core Domain Logic & Telegram Bot Dispatcher
import prisma from "../../config/prisma.js";

export const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Formats a domain notification event into a user-friendly Telegram Bot push message
 */
export const formatTelegramMessage = (event) => {
  const { type, payload = {} } = event;

  switch (type) {
    case "SESSION_PROPOSED":
      return `📢 [ASTU BMS] New Session proposed: "${payload.sessionTitle || "Untitled"}" on ${payload.date || "TBD"}${payload.instructorName ? ` by ${payload.instructorName}` : ""}.`;

    case "TASK_ASSIGNED":
      return `📝 [ASTU BMS] New task posted: "${payload.taskTitle || "New Task"}". Due: ${payload.dueDate || "No deadline"}.`;

    case "SUBMISSION_GRADED":
      return `🎯 [ASTU BMS] Task graded: "${payload.taskTitle || "Task"}". Score: ${payload.score}/${payload.maxScore || 100} (${payload.qualFlag || "GRADED"}).`;

    case "APPLICATION_SUBMITTED":
      return `📩 [ASTU BMS] New application submitted by ${payload.applicantName || "an applicant"} for ${payload.bootcampTitle || "Bootcamp"}.`;

    case "APPLICATION_ACCEPTED":
      return `🎉 [ASTU BMS] Congratulations! You have been accepted to ${payload.bootcampTitle || "the Bootcamp"}.`;

    case "APPLICATION_REJECTED":
      return `ℹ️ [ASTU BMS] Update regarding your application to ${payload.bootcampTitle || "the Bootcamp"}: ${payload.reason || "Application not accepted."}`;

    case "INDUCTION_DECISION":
      return `🏆 [ASTU BMS] Induction outcome for ${payload.bootcampTitle || "Bootcamp"}: ${payload.decision}.`;

    default:
      return `🔔 [ASTU BMS] ${payload.message || payload.title || "Notification update"}`;
  }
};

/**
 * Dispatches notification: persists in-app notification and delivers via Telegram Bot if eligible.
 * Failure to send Telegram push does not abort in-app notification.
 */
export const dispatchNotification = async ({
  event,
  user,
  store,
  telegramAdapter,
}) => {
  if (!event) throw buildError("Notification event is required.", 400);

  const formattedText = formatTelegramMessage(event);

  // 1. In-App Notification Record
  const inAppData = {
    recipientId: event.recipientId || (user && user.id),
    type: event.type,
    title: event.title || event.type,
    message: formattedText,
    read: false,
    createdAt: new Date(),
    metadata: event.payload || {},
  };

  let inAppNotification = null;
  if (store && typeof store.save === "function") {
    inAppNotification = await store.save(inAppData);
  } else {
    inAppNotification = { id: `local-${Date.now()}`, ...inAppData };
  }

  // 2. Telegram Push Delivery
  let telegramSent = false;
  let telegramError = null;

  const hasChatId = user && user.telegramChatId;
  const isEnabledInPrefs =
    !user ||
    !user.preferences ||
    user.preferences.telegramEnabled !== false;

  if (hasChatId && isEnabledInPrefs && telegramAdapter && typeof telegramAdapter.sendMessage === "function") {
    try {
      await telegramAdapter.sendMessage(user.telegramChatId, formattedText);
      telegramSent = true;
    } catch (err) {
      telegramError = err.message || "Failed to deliver Telegram notification";
    }
  }

  return {
    inAppNotification,
    telegramSent,
    telegramError,
  };
};

/**
 * Marks notification as read
 */
export const markNotificationAsRead = (notification) => {
  if (!notification) throw buildError("Notification is required.", 400);

  return {
    ...notification,
    read: true,
    readAt: new Date(),
  };
};

/**
 * Filters list of notifications to unread for a specific user
 */
export const listUnreadNotifications = (notifications = [], userId) => {
  return notifications.filter((n) => n.recipientId === userId && !n.read);
};

// ─── Prisma Database Operations ──────────────────────────────────────────────

export const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { sentAt: "desc" },
  });
};

export const markAsReadAction = async (notificationId, userId) => {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notif) throw buildError("Notification not found", 404);
  if (notif.userId !== userId) throw buildError("Access denied", 403);

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
};
