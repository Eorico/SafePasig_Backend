import express from 'express';
import Admin from '../models/Admin.js';
import type { IAdmin } from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { adminAuth } from '../middleware/adminAuth.js';
import { permit } from '../middleware/adminRBAC.js';
import Report from '../models/Report.js';

const adminRouter = express.Router();

// admin login
adminRouter.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, messsage: "Missing fields"});

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid Credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Credentials" });

    const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '8h' }
    );
    res.json({ success: true, token });
});

// admin request reset password
adminRouter.post("/reset-request-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is Required" });

    const admin = await Admin.findOne({ email }) as IAdmin;
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    
    const resetToken = crypto.randomBytes(32).toString("hex");
    admin.resetToken = resetToken;
    admin.resetTokenExpiry = new Date(Date.now() + 3600000);
    await admin.save();

    // reset link
    // since hinde pa naka deploy ung website
    console.log(`Reset Link: http://safepasig-admin.vercel.app/reset-password/${resetToken}`);
    res.json({ success: true, message: "Password reset link sent to your email " });
});

// admin reset 

adminRouter.post("/reset/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await Admin.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
    }) as IAdmin ;

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save();
    res.json({ success: true, message: "Password reset successfully" });

})

// for deleting the reports if fake or Truth
// RBAC

// get view all reports : all admin can
adminRouter.get("/reports", adminAuth, async (req, res) => {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
});

// report chart statistic data

adminRouter.get("/reports/data-chart", adminAuth, async (req, res) => {
    const reports = await Report.find();

    const dataCharts = {
        weekly: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], trueReports: [0,0,0,0,0,0,0], falseReports: [0,0,0,0,0,0,0] },
        monthly: { labels: ['Week 1','Week 2','Week 3','Week 4'], trueReports: [0,0,0,0], falseReports: [0,0,0,0] },
        yearly: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], trueReports: Array(12).fill(0), falseReports: Array(12).fill(0) }
    };

    reports.forEach(r=> {
        const date = new Date(r.createdAt);
        
        // kada week
        const day = date.getDay();
        if (r.status==="True") dataCharts.weekly.trueReports[day]++;
        if (r.status==="False") dataCharts.weekly.trueReports[day]++;

        // kada buwan
        const week = Math.floor(date.getDate()/7);
        if (week < 4) {
            if (r.status==="True") dataCharts.monthly.trueReports[week]++;
            if (r.status==="False") dataCharts.monthly.trueReports[week]++;
        }

        // kada Taon
        const month = date.getMonth();
        if (r.status==="True") dataCharts.yearly.trueReports[month]++;
        if (r.status==="False") dataCharts.yearly.trueReports[month]++;

        res.json(dataCharts)

    })
});

// put mark report as true or fake admins and superadmins can
adminRouter.put("/reports/:id/status", adminAuth, permit("admin", "superadmin"), 
    async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        report.status = status;
        await report.save();
        res.json({ success: true, report });
    }
);

// delete only superadmins can delete reports
adminRouter.delete("/reports/:id", adminAuth, permit("superadmin"), 
    async (req, res) => {
        const { id } = req.params;

        const report = await Report.findByIdAndDelete(id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        const io = req.app.get('io');
        io.emit('report-deleted' , { id });

        res.json({ success: true, message: "Report deleted successfully" });
    }
);

export default adminRouter;