import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt';
const AdminSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
}, { timestamps: true });
// convert password sa hash
AdminSchema.pre("save", async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
AdminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export default mongoose.model("Admin", AdminSchema, "admins");
