import prisma from "../../config/prisma.js";

export const getProjectsByBootcamp = async (req, res) => {
  try {
    const { bootcampId } = req.params;
    const projects = await prisma.resource.findMany({
      where: { bootcampId },
    });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, url, bootcampId } = req.body;

    if (!title || !bootcampId) {
      return res.status(400).json({ success: false, message: "Title and Bootcamp ID are required" });
    }

    const userId = req.user.id || req.user.userId || req.user._id;

    const project = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        externalUrl: url || null,
        bootcampId,
        uploadedById: userId,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
