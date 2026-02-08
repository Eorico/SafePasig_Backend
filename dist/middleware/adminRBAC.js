export const permit = (...allowedRoles) => (req, res, next) => {
    const adminRole = req.admin?.role;
    if (!adminRole || !allowedRoles.includes(adminRole)) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
};
