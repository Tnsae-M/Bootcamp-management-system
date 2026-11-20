import prisma from "../../config/prisma.js";

export const getResourcesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const resources = await prisma.resource.findMany({
      where: { sessionId },
    });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadResource = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const userId = req.user.id || req.user.userId || req.user._id;

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        fileUrl: req.file.path || req.file.filename,
        mimeType: req.file.mimetype || null,
        sessionId: sessionId || null,
        uploadedById: userId,
      },
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    await prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    if (resource.externalUrl) {
      return res.redirect(resource.externalUrl);
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
