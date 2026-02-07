import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import reportRouter from "./routes/reports.js";
import sosRouter from "./routes/sos.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads", {
  setHeaders: (res) => {
    res.set("X-Content-Type-Options", "nosniff");
  }
}));

// Routes
app.use("/reports", reportRouter);
app.use("/sos", sosRouter);

// ------------------
// MongoDB Connection
// ------------------
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined!");
  process.exit(1); // stop the server if URI is missing
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
