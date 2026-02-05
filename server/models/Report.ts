import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    type: String,
    description: String,
    latitude: Number,
    longitude: Number,
    brgy: String,       // new
    street: String,     // new
    mediaUrl: String,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("Report", ReportSchema);