import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Report from "../models/Report.js";

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST: Create a report
router.post("/", upload.single("media"), async (req, res) => {
  try {
    const { type, description, barangay, street, latitude, longitude } = req.body;

    if (!type || !barangay || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const report = await Report.create({
      type,
      description,
      barangay,
      street,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mediaUrl: req.file ? path.join("uploads", req.file.filename) : null
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET: Fetch all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
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

export default router;
