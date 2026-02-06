import mongoose from "mongoose";

const sosSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

export default mongoose.model("SOS", sosSchema);