import { describe, test, expect } from "vitest";
import {
  validateSessionFeedbackSubmission,
  formatFeedbackForViewer,
  validatePeerReviewSubmission
} from "../src/modules/feedback/feedback.service.js";

describe("feedback.service - validateSessionFeedbackSubmission", () => {
  const session = {
    id: "sess-101",
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // Ended 2 hours ago
  };

  test("allows students with status PRESENT or LATE to submit feedback", () => {
    // Present student
    const presentResult = validateSessionFeedbackSubmission({
      session,
      attendanceRecord: { status: "PRESENT" },
      userId: "u-student-1",
      rating: 5,
      comment: "Great session on database design!"
    });

    expect(presentResult.rating).toBe(5);
    expect(presentResult.status).toBe("PRESENT");
    expect(presentResult.userId).toBe("u-student-1");

    // Late student
    const lateResult = validateSessionFeedbackSubmission({
      session,
      attendanceRecord: { status: "LATE" },
      userId: "u-student-2",
      rating: 4
    });

    expect(lateResult.rating).toBe(4);
    expect(lateResult.status).toBe("LATE");
  });

  test("rejects students marked ABSENT, EXCUSED, or with missing attendance (403)", () => {
    // Absent
    expect(() =>
      validateSessionFeedbackSubmission({
        session,
        attendanceRecord: { status: "ABSENT" },
        userId: "u-student-absent",
        rating: 3
      })
    ).toThrow("Feedback restricted to students who attended the session");

    // Excused
    expect(() =>
      validateSessionFeedbackSubmission({
        session,
        attendanceRecord: { status: "EXCUSED" },
        userId: "u-student-excused",
        rating: 3
      })
    ).toThrow("Feedback restricted to students who attended the session");

    // No attendance record at all
    expect(() =>
      validateSessionFeedbackSubmission({
        session,
        attendanceRecord: null,
        userId: "u-student-none",
        rating: 3
      })
    ).toThrow("Feedback restricted to students who attended the session");
  });

  test("rejects feedback submitted before session ends (400)", () => {
    const futureSession = {
      id: "sess-future",
      endTime: new Date(Date.now() + 60 * 60 * 1000) // Ends in 1 hour
    };

    expect(() =>
      validateSessionFeedbackSubmission({
        session: futureSession,
        attendanceRecord: { status: "PRESENT" },
        userId: "u-eager",
        rating: 5,
        submittedAt: new Date()
      })
    ).toThrow("Feedback cannot be submitted before session ends");
  });

  test("rejects feedback submitted after 48-hour window has expired (403)", () => {
    const oldSession = {
      id: "sess-old",
      endTime: new Date(Date.now() - 50 * 60 * 60 * 1000) // Ended 50 hours ago
    };

    expect(() =>
      validateSessionFeedbackSubmission({
        session: oldSession,
        attendanceRecord: { status: "PRESENT" },
        userId: "u-tardy",
        rating: 4,
        submittedAt: new Date()
      })
    ).toThrow("Feedback window has closed (48 hours expired)");
  });

  test("rejects duplicate feedback submission for the same session (409)", () => {
    expect(() =>
      validateSessionFeedbackSubmission({
        session,
        attendanceRecord: { status: "PRESENT" },
        userId: "u-student-1",
        rating: 4,
        existingFeedback: { id: "fb-existing-1" }
      })
    ).toThrow("Feedback already submitted for this session");
  });
});

describe("feedback.service - formatFeedbackForViewer", () => {
  const feedbacks = [
    {
      id: "fb-1",
      sessionId: "s-1",
      userId: "u-alice",
      studentName: "Alice Walker",
      rating: 5,
      comment: "Loved the hands-on lab!"
    }
  ];

  test("anonymizes student name when viewed by an INSTRUCTOR", () => {
    const formatted = formatFeedbackForViewer({
      feedbacks,
      viewerRole: "INSTRUCTOR"
    });

    expect(formatted[0].studentName).toBe("Anonymous");
    expect(formatted[0].userId).toBeNull();
    expect(formatted[0].rating).toBe(5);
  });

  test("preserves student name and id when viewed by a DIVISION_ADMIN", () => {
    const formatted = formatFeedbackForViewer({
      feedbacks,
      viewerRole: "DIVISION_ADMIN"
    });

    expect(formatted[0].studentName).toBe("Alice Walker");
    expect(formatted[0].userId).toBe("u-alice");
  });
});

describe("feedback.service - validatePeerReviewSubmission", () => {
  const groupMembers = [
    { userId: "u-member-1" },
    { userId: "u-member-2" },
    { userId: "u-member-3" }
  ];

  test("validates and creates a peer review record between group teammates", () => {
    const review = validatePeerReviewSubmission({
      submissionId: "sub-milestone-1",
      reviewerId: "u-member-1",
      revieweeId: "u-member-2",
      groupMembers,
      rating: 5,
      comment: "Crucial help on the database schema setup"
    });

    expect(review.submissionId).toBe("sub-milestone-1");
    expect(review.reviewerId).toBe("u-member-1");
    expect(review.revieweeId).toBe("u-member-2");
    expect(review.rating).toBe(5);
  });

  test("rejects self-review (400)", () => {
    expect(() =>
      validatePeerReviewSubmission({
        submissionId: "sub-milestone-1",
        reviewerId: "u-member-1",
        revieweeId: "u-member-1", // Self-review!
        groupMembers,
        rating: 5
      })
    ).toThrow("Cannot submit peer review for yourself");
  });

  test("rejects review if reviewer or reviewee is not in the group (403)", () => {
    expect(() =>
      validatePeerReviewSubmission({
        submissionId: "sub-milestone-1",
        reviewerId: "u-member-1",
        revieweeId: "u-outsider", // Not in group!
        groupMembers,
        rating: 4
      })
    ).toThrow("Both users must be members of the same group");
  });

  test("rejects duplicate peer review for same teammate in same milestone submission (409)", () => {
    expect(() =>
      validatePeerReviewSubmission({
        submissionId: "sub-milestone-1",
        reviewerId: "u-member-1",
        revieweeId: "u-member-2",
        groupMembers,
        rating: 4,
        existingPeerReview: { id: "pr-existing-1" }
      })
    ).toThrow("Peer review already submitted for this teammate");
  });
});
