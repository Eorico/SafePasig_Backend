import express from "express";
import mongoose from "mongoose";
import cors from "cors"; 
import router from "./routes/reports.js";  

const app = express();

app.use(cors());
app.use(express.json());
app.use("/reports", router);

mongoose.connect(
    "mongodb+srv://eoricogonzales_db_user:pOziz25jmXeUXup9@safepasigcluster.nlwimol.mongodb.net/?appName=SafePasigCluster"
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
