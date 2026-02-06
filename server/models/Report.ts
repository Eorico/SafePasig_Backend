import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  type: { type: String, required: true },          
  description: { type: String },
  barangay: { type: String, required: true },  
  street: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  mediaUrl: { type: String },
  status: { type: String, default: "Pending" },    
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", ReportSchema);
