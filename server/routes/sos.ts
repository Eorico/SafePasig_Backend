import express from 'express';
import SOS from '../models/SOS.js';
import User from '../models/User.js';
import { sendPushNotification } from '../uti/push.js';

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

sosRouter.get("/", async (req, res) => {
  try {
    const sosList = await SOS.find({ active: true }).sort({ createdAt: -1 });
    res.json(sosList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch SOS' });
  }
});


export default sosRouter;
