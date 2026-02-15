import express from 'express';
import Report from '../models/Report.js';
import { sendPushNotificationToAll } from '../utils/sendNotif.js';

const sosRouter = express.Router();

sosRouter.post('/', async (req, res) => {
    try {
        const {  deviceId, latitude, longitude } = req.body;

        if ( !deviceId || !latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Missing coordinates and Device Id" });
        }

        const sosReport = await Report.create({
            deviceId,
            type: 'SOS',
            description: 'Emergency SOS Triggered',
            barangay: "Unkown",
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        });

        const io = req.app.get("io");
        io.emit("sos", {
            message: "SOS triggered!",
            deviceId: sosReport.deviceId,
            latitude: sosReport.latitude,
            longitude: sosReport.longitude,
            id: sosReport._id,
        });

        await sendPushNotificationToAll(
            "SOS Alert!",
            `An SOS was triggered at Lat:${sosReport.latitude}, Lng:${sosReport.longitude}`
        );


        res.json({ success: true, message: "SOS sent", sosReport });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default sosRouter;