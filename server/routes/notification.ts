import express from "express";
import Device from "../models/Device.js";

const notifRouter = express.Router();

// Register device token
notifRouter.post("/register", async (req, res) => {
  try {
    const { deviceId, expoPushToken } = req.body;
    if (!deviceId || !expoPushToken) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await Device.findOneAndUpdate(
      { deviceId },
      { expoPushToken },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Token registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default notifRouter;
