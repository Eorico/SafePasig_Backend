import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./adminAuth.js";

export const permit = (...allowedRoles: string[]) => 
    (req: AuthRequest, res: Response, next: NextFunction) => 
    {
        const adminRole = req.admin?.role;
        if (!adminRole || !allowedRoles.includes(adminRole)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        next();
    };