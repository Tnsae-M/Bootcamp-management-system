import * as taskService from "./task.service.js";

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body);
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.bootcampId) filters.bootcampId = req.query.bootcampId;
    if (req.query.type) filters.type = req.query.type;

    const tasks = await taskService.getTasks(filters);
    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
