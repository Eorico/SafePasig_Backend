import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Report from "../models/Report.js";
import { WebSocketServer } from "ws";

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

// -----------------
// POST: Create a report
// -----------------
router.post("/", upload.single("media"), async (req: any, res: any) => {
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

    // Broadcast new report to WebSocket clients
    const wss: WebSocketServer | undefined = req.app.get("wss");
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "new_report", report }));
        }
      });
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------
// DELETE: Remove a report
// -----------------
router.delete("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    if (report.mediaUrl) {
      const filepath = path.join(process.cwd(), report.mediaUrl);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    // Broadcast deletion
    const wss: WebSocketServer | undefined = req.app.get("wss");
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "delete_report", reportId: id }));
        }
      });
    }

    res.json({ success: true, message: "Report deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------
// GET: Fetch reports
// -----------------
router.get("/", async (_req: any, res: any) => {
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

export default router;
