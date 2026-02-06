import express from 'express';
import SOS from '../models/SOS.js';

const sosRouter = express.Router();

sosRouter.post("/", async (req, res) => {
    const { latitude, longitude } = req.body;
    const sos = await SOS.create({
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude)
    })
});

sosRouter.get("/", async (req, res) => {
    const sos = await SOS.find({ active: true }).sort({ createdAt: -1 });
    res.json(sos);
})

export default sosRouter;