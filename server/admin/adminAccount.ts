import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

export const createDefaultAdmins = async () => {
  // Use environment variables for emails/passwords
  const accounts = [
    { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: "admin" },
    { email: process.env.SUPERADMIN_EMAIL, password: process.env.SUPERADMIN_PASSWORD, role: "superadmin" }
  ];

  for (const acc of accounts) {
    const exists = await Admin.findOne({ email: acc.email });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(acc.password!, 10);
      const newAdmin = new Admin({
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
        resetToken: null,
        resetTokenExpiry: null
      });
      await newAdmin.save();
      console.log(`Created ${acc.role} account: ${acc.email}`);
    } else {
      console.log(`${acc.role} account already exists: ${acc.email}`);
    }
  }
};
