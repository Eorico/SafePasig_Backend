import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
    email: string;
    password: string;
    role: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
    comparePassword: (password: string) => Promise<boolean>;
}

const AdminSchema: Schema<IAdmin> = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
}, { timestamps: true });

// convert password sa hash
AdminSchema.pre<IAdmin>("save", async function() {
    if (!this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt); 
    }
});

AdminSchema.methods.comparePassword = async function(password: string) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model("Admin", AdminSchema, "admins");