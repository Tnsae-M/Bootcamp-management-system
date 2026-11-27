import prisma from "../../config/prisma.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Forms a new student capstone group with default Group Leader assignment.
 */
export const formGroup = ({
  bootcampId,
  name,
  creatorId,
  existingGroupMemberships = []
}) => {
  if (!bootcampId || !name || !creatorId) {
    throw buildError("bootcampId, group name, and creatorId are required", 400);
  }

  // Check if creator is already in a group in this bootcamp
  const alreadyInGroup = existingGroupMemberships.some(
    (m) => m.userId === creatorId && m.bootcampId === bootcampId
  );

  if (alreadyInGroup) {
    throw buildError("User is already a member of a group in this bootcamp", 409);
  }

  const groupId = `grp_${Date.now()}`;
  const group = {
    id: groupId,
    bootcampId,
    name: name.trim(),
    createdAt: new Date()
  };

  const members = [
    {
      id: `gm_${Date.now()}_1`,
      groupId,
      userId: creatorId,
      isLeader: true,
      joinedAt: new Date()
    }
  ];

  return { group, members };
};

/**
 * Adds a student to an existing group, checking size limits (max 8) and duplicate membership.
 */
export const addMemberToGroup = ({
  group,
  currentMembers,
  userId,
  studentId,
  isEnrolledStudent = true,
  existingGroupMemberships = []
}) => {
  const effectiveUserId = userId || studentId;

  if (!group || !currentMembers) {
    throw buildError("Group and current members are required", 400);
  }

  // Group size limit: 8 students max (SRS Section 4.7)
  if (currentMembers.length >= 8) {
    throw buildError("Group capacity cannot exceed 8 members", 400);
  }

  // Already in this group?
  if (currentMembers.some((m) => m.userId === effectiveUserId)) {
    throw buildError("User is already a member of this group", 409);
  }

  // Already in another group in the same bootcamp?
  const alreadyInGroup = existingGroupMemberships.some(
    (m) => m.userId === effectiveUserId && m.bootcampId === group.bootcampId
  );
  if (alreadyInGroup) {
    throw buildError("User is already a member of a group in this bootcamp", 409);
  }

  const newMember = {
    id: `gm_${Date.now()}_${currentMembers.length + 1}`,
    groupId: group.id,
    userId: effectiveUserId,
    isLeader: false,
    joinedAt: new Date()
  };

  return newMember;
};

export const addStudentToGroup = addMemberToGroup;

/**
 * Designates or transfers the Group Leader role within a group.
 */
export const reassignGroupLeader = ({
  currentMembers = [],
  newLeaderUserId,
  actorId,
  isInstructorOrAdmin = false
}) => {
  const currentLeader = currentMembers.find((m) => m.isLeader);

  if (actorId && !isInstructorOrAdmin) {
    if (!currentLeader || currentLeader.userId !== actorId) {
      throw buildError("Only the current group leader or an instructor can transfer leadership", 403);
    }
  }

  const targetMember = currentMembers.find((m) => m.userId === newLeaderUserId);
  if (!targetMember) {
    throw buildError("User is not a member of this group", 404);
  }

  return currentMembers.map((m) => ({
    ...m,
    isLeader: m.userId === newLeaderUserId
  }));
};

export const designateGroupLeader = reassignGroupLeader;

// ─── Prisma Database Operations ──────────────────────────────────────────────

export const createGroupAction = async ({ bootcampId, name, creatorId }) => {
  const existingMemberships = await prisma.groupMember.findMany({
    where: { userId: creatorId, group: { bootcampId } },
    include: { group: true },
  });

  const formed = formGroup({
    bootcampId,
    name,
    creatorId,
    existingGroupMemberships: existingMemberships.map((m) => ({
      userId: m.userId,
      bootcampId: m.group.bootcampId,
    })),
  });

  return await prisma.group.create({
    data: {
      bootcampId: formed.group.bootcampId,
      name: formed.group.name,
      members: {
        create: {
          userId: creatorId,
          isLeader: true,
        },
      },
    },
    include: {
      members: { include: { user: true } },
    },
  });
};

export const getGroupsByBootcamp = async (bootcampId) => {
  return await prisma.group.findMany({
    where: { bootcampId },
    include: {
      members: {
        include: {
          user: { select: { id: true, fullName: true, email: true, universityId: true } },
        },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const assignLeaderAction = async ({ groupId, newLeaderId, actorId }) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw buildError("Group not found", 404);

  const updatedMembers = designateGroupLeader({
    members: group.members,
    newLeaderId,
    actorId,
    isInstructorOrAdmin: true,
  });

  await prisma.$transaction(
    updatedMembers.map((m) =>
      prisma.groupMember.update({
        where: { id: m.id },
        data: { isLeader: m.isLeader },
      })
    )
  );

  return await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { include: { user: true } } },
  });
};

export const addMember = async (groupId, userId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw buildError("Group not found", 404);

  if (group.members.length >= 8) {
    throw buildError("Group has reached maximum size of 8 members", 400);
  }

  const existing = group.members.find((m) => m.userId === userId);
  if (existing) throw buildError("User is already in this group", 409);

  return await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      isLeader: false,
    },
    include: { user: true },
  });
};

export const removeMember = async (groupId, userId) => {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });
  if (!member) throw buildError("Member not found in this group", 404);

  await prisma.groupMember.delete({
    where: { id: member.id },
  });
  return { deleted: true, groupId, userId };
};
