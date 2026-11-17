import { describe, test, expect, vi } from "vitest";
import {
  formatTelegramMessage,
  dispatchNotification,
  markNotificationAsRead,
  listUnreadNotifications,
} from "../src/modules/notification/notification.service.js";

describe("notifications.service - formatTelegramMessage", () => {
  test("formats SESSION_PROPOSED event with ASTU branding and session details", () => {
    const text = formatTelegramMessage({
      type: "SESSION_PROPOSED",
      payload: {
        sessionTitle: "Reverse Engineering x86",
        date: "2026-11-20 14:00",
        instructorName: "Abebe Bikila",
      },
    });

    expect(text).toContain("[ASTU BMS]");
    expect(text).toContain("Reverse Engineering x86");
    expect(text).toContain("2026-11-20 14:00");
  });

  test("formats TASK_ASSIGNED event with deadline", () => {
    const text = formatTelegramMessage({
      type: "TASK_ASSIGNED",
      payload: {
        taskTitle: "Buffer Overflow Lab 1",
        dueDate: "2026-11-25 23:59",
      },
    });

    expect(text).toContain("[ASTU BMS]");
    expect(text).toContain("Buffer Overflow Lab 1");
    expect(text).toContain("2026-11-25 23:59");
  });

  test("formats SUBMISSION_GRADED event with score and qualitative feedback", () => {
    const text = formatTelegramMessage({
      type: "SUBMISSION_GRADED",
      payload: {
        taskTitle: "Buffer Overflow Lab 1",
        score: 95,
        maxScore: 100,
        qualFlag: "EXCELLENT",
      },
    });

    expect(text).toContain("[ASTU BMS]");
    expect(text).toContain("95/100");
    expect(text).toContain("EXCELLENT");
  });

  test("falls back gracefully to generic message for unknown event types", () => {
    const text = formatTelegramMessage({
      type: "CUSTOM_ANNOUNCEMENT",
      payload: { message: "Campus power maintenance this Saturday" },
    });

    expect(text).toContain("[ASTU BMS]");
    expect(text).toContain("Campus power maintenance this Saturday");
  });
});

describe("notifications.service - dispatchNotification", () => {
  test("persists in-app notification and sends Telegram push when user has telegramChatId", async () => {
    const fakeStore = {
      save: vi.fn(async (n) => ({ ...n, id: "notif-1" })),
    };
    const fakeTelegramAdapter = {
      sendMessage: vi.fn(async () => ({ ok: true })),
    };

    const user = {
      id: "usr-1",
      telegramChatId: "987654321",
      preferences: { telegramEnabled: true },
    };

    const event = {
      type: "TASK_ASSIGNED",
      recipientId: "usr-1",
      payload: { taskTitle: "Crypto Challenge", dueDate: "Tomorrow" },
    };

    const result = await dispatchNotification({
      event,
      user,
      store: fakeStore,
      telegramAdapter: fakeTelegramAdapter,
    });

    expect(result.inAppNotification.id).toBe("notif-1");
    expect(fakeStore.save).toHaveBeenCalledOnce();
    expect(fakeTelegramAdapter.sendMessage).toHaveBeenCalledWith(
      "987654321",
      expect.stringContaining("Crypto Challenge")
    );
    expect(result.telegramSent).toBe(true);
  });

  test("skips Telegram push when user has no telegramChatId or disabled preference", async () => {
    const fakeStore = {
      save: vi.fn(async (n) => ({ ...n, id: "notif-2" })),
    };
    const fakeTelegramAdapter = {
      sendMessage: vi.fn(),
    };

    const user = {
      id: "usr-2",
      telegramChatId: null, // no chat id linked
    };

    const event = {
      type: "TASK_ASSIGNED",
      recipientId: "usr-2",
      payload: { taskTitle: "Web Security 101" },
    };

    const result = await dispatchNotification({
      event,
      user,
      store: fakeStore,
      telegramAdapter: fakeTelegramAdapter,
    });

    expect(result.inAppNotification.id).toBe("notif-2");
    expect(fakeStore.save).toHaveBeenCalledOnce();
    expect(fakeTelegramAdapter.sendMessage).not.toHaveBeenCalled();
    expect(result.telegramSent).toBe(false);
  });

  test("handles Telegram API failures gracefully without failing in-app persistence", async () => {
    const fakeStore = {
      save: vi.fn(async (n) => ({ ...n, id: "notif-3" })),
    };
    const fakeTelegramAdapter = {
      sendMessage: vi.fn(async () => {
        throw new Error("Telegram Bot API rate limit");
      }),
    };

    const user = {
      id: "usr-3",
      telegramChatId: "12345",
    };

    const event = {
      type: "TASK_ASSIGNED",
      recipientId: "usr-3",
      payload: { taskTitle: "Kernel Exploitation" },
    };

    // Should NOT throw!
    const result = await dispatchNotification({
      event,
      user,
      store: fakeStore,
      telegramAdapter: fakeTelegramAdapter,
    });

    expect(result.inAppNotification.id).toBe("notif-3");
    expect(result.telegramSent).toBe(false);
    expect(result.telegramError).toContain("Telegram Bot API rate limit");
  });
});

describe("notifications.service - read & list unread", () => {
  test("markNotificationAsRead sets read status to true and readAt timestamp", () => {
    const notif = {
      id: "notif-1",
      read: false,
    };

    const updated = markNotificationAsRead(notif);
    expect(updated.read).toBe(true);
    expect(updated.readAt).toBeInstanceOf(Date);
  });

  test("listUnreadNotifications filters to unread items for user", () => {
    const all = [
      { id: "1", recipientId: "u1", read: false },
      { id: "2", recipientId: "u1", read: true },
      { id: "3", recipientId: "u2", read: false },
    ];

    const unread = listUnreadNotifications(all, "u1");
    expect(unread).toHaveLength(1);
    expect(unread[0].id).toBe("1");
  });
});

