import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Report from "../models/Report.js";

const reportRouter = express.Router();

// automatic deletion of old reports with media
const VIDEO_EXPIRATION = 30 * 60 * 1000;

setInterval(async () => {
  try {
    const now = Date.now();
    const expiredReports = await Report.find({
      mediaUrl: { $exists: true, $ne: null },
      createdAt: { $lte: new Date(now - VIDEO_EXPIRATION) },
    });

    for (const report of expiredReports) {
      if (report.mediaUrl && typeof report.mediaUrl === "string") {
        const filepath = path.join(process.cwd(), report.mediaUrl);
        if(fs.existsSync(filepath)) fs.unlinkSync(filepath);

        await Report.findByIdAndDelete(report._id);

        console.log(`Deleted Report and Media: ${report._id}`);
        
      }
    }
  } catch (error) {
    console.error("Error deleting expired reports:", error);
  }
}, 60 * 1000);

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "uploads";
      
    if (file.mimetype.startsWith("video/")) {
      dir = path.join(dir, "videos");
    }

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Only images and video are allowed!"))
    }
    cb(null, true);
  }

});

// POST: Create a report
reportRouter.post("/", upload.single("media"), async (req, res) => {
  try {
    const { type, description, barangay, street, latitude, longitude } = req.body;

    if (!type || !barangay || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let mediaPath: string | null = null;
    
    if (req.file) {
      const folder = req.file.mimetype.startsWith("video/") ? "videos" : "";
      mediaPath = path.join("uploads", folder, req.file.filename);
    }

    const report = await Report.create({
      type,
      description,
      barangay,
      street,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mediaUrl: mediaPath
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET: Fetch all reports
reportRouter.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(50);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

reportRouter.delete("/:id", async (req, res) => {
  try {
    const {id} = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    if (report.mediaUrl) {
      const filepath = path.join(process.cwd(), report.mediaUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }

    res.json({ success: true, message: "Report deleted successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" })
  }
})

export default reportRouter;
