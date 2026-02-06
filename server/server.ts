import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import reportRouter from "./routes/reports.js";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/reports", reportRouter);

// ------------------
// MongoDB Connection
// ------------------
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined!");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 3000;
    // Create HTTP server manually
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Create WebSocket server using the HTTP server
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
      console.log("New client connected");
      ws.send(JSON.stringify({ type: "info", message: "Connected to reports WebSocket" }));

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    // Make wss globally accessible to routes
    app.set("wss", wss);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
