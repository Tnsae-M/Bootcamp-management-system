import * as groupService from "./group.service.js";

export const createGroup = async (req, res, next) => {
  try {
    const creatorId = req.user.id || req.user.userId;
    const { bootcampId, name } = req.body;
    const group = await groupService.createGroupAction({
      bootcampId,
      name,
      creatorId,
    });
    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    return next(error);
  }
};

export const getGroupsByBootcamp = async (req, res, next) => {
  try {
    const groups = await groupService.getGroupsByBootcamp(req.params.bootcampId);
    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    return next(error);
  }
};

export const assignLeader = async (req, res, next) => {
  try {
    const actorId = req.user.id || req.user.userId;
    const { newLeaderId } = req.body;
    const group = await groupService.assignLeaderAction({
      groupId: req.params.id,
      newLeaderId,
      actorId,
    });
    return res.status(200).json({
      success: true,
      message: "Group leader assigned successfully",
      data: group,
    });
  } catch (error) {
    return next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const member = await groupService.addMember(req.params.id, userId);
    return res.status(201).json({
      success: true,
      message: "Member added to group",
      data: member,
    });
  } catch (error) {
    return next(error);
  }
};
