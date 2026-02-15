import fetch from "node-fetch";
import Device from "../models/Device.js";

export async function sendPushNotificationToAll(title: any, body: any) {
  try {
    const tokens = await Device.find();
    const messages = tokens.map(t => ({
      to: t.expoPushToken,
      sound: "default",
      title,
      body,
    }));

    for (const msg of messages) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    }
  } catch (err) {
    console.error("Error sending push notifications:", err);
  }
}
