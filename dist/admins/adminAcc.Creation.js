import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
dotenv.config();
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MONGO URI is not defined in .env");
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(async () => {
    console.log("MongoDB connected to seeding admins!");
    const defaultAccounts = [
        {
            email: "admin123@gmail.com",
            password: "safePasig123",
            role: "admin",
        },
        {
            email: "superadmin123@gmail.com",
            password: "S_admin123",
            role: "superadmin",
        },
    ];
    for (const acc of defaultAccounts) {
        const exists = await Admin.findOne({ email: acc.email });
        if (!exists) {
            const newAdmin = new Admin(acc);
            await newAdmin.save();
            console.log(`Created: ${acc.role}: ${acc.email}`);
        }
        else {
            console.log(`${acc.role} already exists: ${acc.email}`);
        }
    }
    mongoose.disconnect();
    console.log("Seeding finished, MongoDB disconnected.");
})
    .catch(e => {
    console.error("MongoDB connection error", e);
});
