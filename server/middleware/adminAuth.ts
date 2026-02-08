import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
    admin?: any;
}

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token Provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid to token" });
    }
}