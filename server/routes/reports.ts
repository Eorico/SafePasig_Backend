import express from 'express';
import multer from 'multer';

import Report from '../models/Report.js';

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("media"), async (req, res) => {
    try {
        const { type, description, latitude, longitude, brgy, street } = req.body;

        const report = await Report.create({
            type,
            description,
            latitude: parseFloat(latitude), // ensure it's a number
            longitude: parseFloat(longitude),
            brgy,
            street,
            mediaUrl: req.file ? req.file.path : null
        });

        res.json({ success: true, report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create report" });
    }
});

router.get("/", async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
});


export default router;