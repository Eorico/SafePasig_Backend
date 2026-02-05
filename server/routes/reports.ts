import express from 'express';
import multer from 'multer';

import Report from '../models/Report.js';

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("media"), async (req: any, res: any) => {
    const { type, description, latitude, longitude } = req.body;

    const report = await Report.create({
        type,
        description,
        latitude,
        longitude,
        mediaUrl: req.file.path
    });

    res.json(report);
});

router.get("/", async (req: any, res: any) => {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
});

export default router;