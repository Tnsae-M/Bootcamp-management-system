import Group from "./group.model.js";
import Enrollment from "../enrollments/enrollment.model.js";
import GroupProgress from "./progress.model.js";
import Bootcamp from "../bootcamps/bootcamp.model.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Forms a new student capstone group with default Group Leader assignment.
 *
 * Grounded in:
 * - SRS v2.0 Section 4.7 (Group size: 2-8 students, one group per student per bootcamp)
 * - CONTEXT.md (Group, Group Leader)
 *
 * @param {Object} params
 * @param {string} params.bootcampId
 * @param {string} params.name
 * @param {string} params.creatorId
 * @param {Array<Object>} [params.existingGroupMemberships=[]]
 * @returns {Object} { group, members }
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

  return {
    group,
    members
  };
};

/**
 * Adds an enrolled student to an existing group, validating capacity (max 8)
 * and single-group membership invariants.
 *
 * @param {Object} params
 * @param {Object} params.group
 * @param {Array<Object>} params.currentMembers
 * @param {string} params.userId
 * @param {Array<Object>} [params.existingGroupMemberships=[]]
 * @returns {Object} New GroupMember record
 */
export const addMemberToGroup = ({
  group,
  currentMembers,
  userId,
  existingGroupMemberships = []
}) => {
  // Max capacity constraint: 8 members (SRS v2.0 Section 4.7)
  if (currentMembers.length >= 8) {
    throw buildError("Group capacity cannot exceed 8 members", 400);
  }

  // Check if student already in this group
  if (currentMembers.some((m) => m.userId === userId)) {
    throw buildError("User is already in this group", 409);
  }

  // Check if student already in another group in this bootcamp
  const alreadyInOtherGroup = existingGroupMemberships.some(
    (m) => m.userId === userId && m.bootcampId === group.bootcampId
  );

  if (alreadyInOtherGroup) {
    throw buildError("User is already a member of a group in this bootcamp", 409);
  }

  return {
    id: `gm_${Date.now()}_${currentMembers.length + 1}`,
    groupId: group.id,
    userId,
    isLeader: false,
    joinedAt: new Date()
  };
};

/**
 * Reassigns the Group Leader role to another existing member of the group.
 *
 * @param {Object} params
 * @param {Array<Object>} params.currentMembers
 * @param {string} params.newLeaderUserId
 * @returns {Array<Object>} Updated member list
 */
export const reassignGroupLeader = ({ currentMembers, newLeaderUserId }) => {
  const targetMember = currentMembers.find((m) => m.userId === newLeaderUserId);
  if (!targetMember) {
    throw buildError("User is not a member of this group", 404);
  }

  return currentMembers.map((m) => ({
    ...m,
    isLeader: m.userId === newLeaderUserId
  }));
};

//  Create group
export const createGroup = async (data, creatorId) => {
  const { bootcampId, members = [] } = data;

  //  Validate members are enrolled
  for (const userId of members) {
    const enrollment = await Enrollment.findOne({
      userId,
      bootcampId,
    });

    if (!enrollment) {
      throw buildError(`User ${userId} is not enrolled`, 400);
    }
  }

  return await Group.create({
    ...data,
    createdBy: creatorId,
  });
};

//  Get groups by bootcamp
export const getGroupsByBootcamp = async (bootcampId) => {
  return await Group.find({ bootcampId })
    .populate("members", "name email")
    .populate("mentor", "name email")
    .populate("createdBy", "name");
};


//  Add member
export const addMember = async (groupId, userId, bootcampId) => {
  const group = await Group.findById(groupId);
  if (!group) throw buildError("Group not found", 404);

  const enrollment = await Enrollment.findOne({
    userId,
    bootcampId,
  });

  if (!enrollment) {
    throw buildError("User not enrolled in this bootcamp", 400);
  }

  if (group.members.includes(userId)) {
    throw buildError("User already in group", 409);
  }

  group.members.push(userId);
  await group.save();

  return group;
};

//  Remove member
export const removeMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw buildError("Group not found", 404);

  group.members = group.members.filter(
    (id) => id.toString() !== userId
  );

  await group.save();
  return group;
};

// Delete group
export const deleteGroup = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw buildError("Group not found", 404);

  await Group.findByIdAndDelete(groupId);
  return { id: groupId };
};

// --- Weekly Progress ---

export const submitGroupProgress = async (data, studentId) => {
  const { groupId, bootcampId, title, description, links } = data;

  // 1. Verify Group & Membership
  const group = await Group.findById(groupId);
  if (!group) throw buildError("Group not found", 404);
  if (!group.members.includes(studentId)) {
    throw buildError("Only group members can submit progress", 403);
  }

  // 2. Calculate Week Number
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) throw buildError("Bootcamp not found", 404);
  
  const startDate = bootcamp.startDate || bootcamp.createdAt;
  const now = new Date();
  const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.max(1, Math.ceil((diffDays + 1) / 7));

  // 3. Create Progress (Unique constraint in model handles 1 per week)
  try {
    return await GroupProgress.create({
      groupId,
      bootcampId,
      submittedBy: studentId,
      weekNumber,
      title,
      description,
      links
    });
  } catch (err) {
    if (err.code === 11000) {
      throw buildError(`Progress for Week ${weekNumber} has already been submitted for this group`, 409);
    }
    throw err;
  }
};

export const getGroupProgress = async (groupId) => {
  return await GroupProgress.find({ groupId })
    .populate("submittedBy", "name")
    .sort({ weekNumber: -1 });
};