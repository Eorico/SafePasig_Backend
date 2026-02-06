import express from 'express';
import SOS from '../models/SOS.js';
import User from '../models/User.js';
import { sendPushNotification } from '../utils/push.js';

const sosRouter = express.Router();

sosRouter.post("/", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const sos = await SOS.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      active: true
    });

    const users = await User.find({ expoPushToken: { $ne: null } });

    for (const user of users) {
      await sendPushNotification(user.expoPushToken, {
        title: "🚨 SOS Alert",
        body: "Someone near you needs help!"
      });
    }

    res.json({ success: true, sos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default sosRouter;
