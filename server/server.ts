import express from 'express';
import mongoose from 'mongoose';
import router from '../routes/reports.js';

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use("/reports", router);

mongoose.connect(
    "mongodb+srv://eoricogonzales_db_user:pOziz25jmXeUXup9@safepasigcluster.nlwimol.mongodb.net/?appName=SafePasigCluster"
)

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});