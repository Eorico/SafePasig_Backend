import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/reports.js"; // your reports routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true })); // parse form-data

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/reports", router);

// MongoDB connection
const MONGO_URI =
  "mongodb+srv://eoricogonzales_db_user:pOziz25jmXeUXup9@safepasigcluster.nlwimol.mongodb.net/safepasig?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI) // no need for options in Mongoose 6+
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
