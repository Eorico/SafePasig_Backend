import express from 'express';
import Report from '../models/Report.js';

const sosRouter = express.Router();

sosRouter.post('/', async (req, res) => {
    try {
        const { latitude, longitude, isPWD } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Missing coordinates" });
        }

        const sosReport = await Report.create({
            type: 'SOS',
            description: 'Emergency SOS Triggered',
            barangay: "Unkown",
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            isPWD: isPWD === 'true' || isPWD === true, 
        });

        const io = req.app.get("io");
        io.emit("sos", {
            message: "SOS triggered!",
            latitude: sosReport.latitude,
            longitude: sosReport.longitude,
            id: sosReport._id,
            isPWD: sosReport.isPWD,
        });

        res.json({ success: true, message: "SOS sent", sosReport });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default sosRouter;