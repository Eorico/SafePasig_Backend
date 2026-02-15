import mongoose from "mongoose";

const DeviceTokenSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  expoPushToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DeviceToken", DeviceTokenSchema);
