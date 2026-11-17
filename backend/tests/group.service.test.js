import { describe, test, expect } from "vitest";
import {
  formGroup,
  addMemberToGroup,
  reassignGroupLeader
} from "../src/modules/groups/group.service.js";

describe("group.service - formGroup", () => {
  test("creates a group and assigns the creator as Group Leader", () => {
    const bootcampId = "bc-dev-2026";
    const creatorId = "u-alice";
    const name = "CyberTitans";

    const result = formGroup({
      bootcampId,
      name,
      creatorId,
      existingGroupMemberships: []
    });

    expect(result.group).toBeDefined();
    expect(result.group.name).toBe("CyberTitans");
    expect(result.group.bootcampId).toBe("bc-dev-2026");

    expect(result.members).toHaveLength(1);
    expect(result.members[0].userId).toBe("u-alice");
    expect(result.members[0].isLeader).toBe(true);
  });

  test("rejects group formation if creator is already in a group in this bootcamp (409)", () => {
    const existingMemberships = [
      { userId: "u-bob", bootcampId: "bc-dev-2026", groupId: "grp-existing-1" }
    ];

    expect(() =>
      formGroup({
        bootcampId: "bc-dev-2026",
        name: "SecondGroup",
        creatorId: "u-bob",
        existingGroupMemberships: existingMemberships
      })
    ).toThrow("User is already a member of a group in this bootcamp");
  });
});

describe("group.service - addMemberToGroup", () => {
  const mockGroup = {
    id: "grp-alpha",
    bootcampId: "bc-dev-2026",
    name: "AlphaTeam"
  };

  test("adds a new member to the group with isLeader false", () => {
    const currentMembers = [
      { id: "m-1", groupId: "grp-alpha", userId: "u-leader", isLeader: true }
    ];

    const newMember = addMemberToGroup({
      group: mockGroup,
      currentMembers,
      userId: "u-recruit-2"
    });

    expect(newMember.userId).toBe("u-recruit-2");
    expect(newMember.isLeader).toBe(false);
    expect(newMember.groupId).toBe("grp-alpha");
  });

  test("rejects adding a member if group has reached max capacity of 8 (400)", () => {
    // Group already has 8 members
    const currentMembers = Array.from({ length: 8 }, (_, i) => ({
      id: `m-${i}`,
      groupId: "grp-alpha",
      userId: `u-user-${i}`,
      isLeader: i === 0
    }));

    expect(() =>
      addMemberToGroup({
        group: mockGroup,
        currentMembers,
        userId: "u-ninth-user"
      })
    ).toThrow("Group capacity cannot exceed 8 members");
  });

  test("rejects adding a student who is already in another group in this bootcamp (409)", () => {
    const currentMembers = [
      { id: "m-1", groupId: "grp-alpha", userId: "u-leader", isLeader: true }
    ];

    const existingMemberships = [
      { userId: "u-taken", bootcampId: "bc-dev-2026", groupId: "grp-other" }
    ];

    expect(() =>
      addMemberToGroup({
        group: mockGroup,
        currentMembers,
        userId: "u-taken",
        existingGroupMemberships: existingMemberships
      })
    ).toThrow("User is already a member of a group in this bootcamp");
  });
});

describe("group.service - reassignGroupLeader", () => {
  const currentMembers = [
    { id: "m-1", groupId: "grp-alpha", userId: "u-alice", isLeader: true },
    { id: "m-2", groupId: "grp-alpha", userId: "u-bob", isLeader: false }
  ];

  test("successfully swaps group leadership to another active member", () => {
    const updatedMembers = reassignGroupLeader({
      currentMembers,
      newLeaderUserId: "u-bob"
    });

    const alice = updatedMembers.find((m) => m.userId === "u-alice");
    const bob = updatedMembers.find((m) => m.userId === "u-bob");

    expect(alice.isLeader).toBe(false);
    expect(bob.isLeader).toBe(true);
  });

  test("rejects leadership reassignment to a non-member (404)", () => {
    expect(() =>
      reassignGroupLeader({
        currentMembers,
        newLeaderUserId: "u-outsider"
      })
    ).toThrow("User is not a member of this group");
  });
});
