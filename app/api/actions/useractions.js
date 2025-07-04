"use server"

import connectDb from "@/db/connectDb"
import User from "@/models/User"
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";



export const fetchuser = async (email) => {
    await connectDb();

    let user = await User.findOne({ email });
    if (!user) {
        return { error: "User not found" };
    }

    return user.toObject({ flattenObjectIds: true });
};





export async function updateProfile(data, email) {
  try {
    await connectDb();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: data },
      { new: true }
    );
    return {  success: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


export const Newusers = async (name, email, password) => {
    await connectDb();
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email : normalizedEmail });

    if (existingUser) {
        return { status: 400, error: "Email is already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    return { status: 200, success: "Profile created successfully" };
};

export const deleteCompanyLogo = async (id) => {
    await connectDb();

    
    const updatedUser = await User.findByIdAndUpdate(
        id,
        {$set:{
            companylogo: null } 
        }
    );

    if (!updatedUser) {
        return { error: "User not found" };
    }

    return { success: "Logo deleted successfully" };
}



export const changeUserPassword = async (email, oldPassword, newPassword) => {
    await connectDb();
    try {
      const user = await User.findOne({ email });
      if (!user) return { success: false, message: "User not found" };
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return { success: false, message: "Old password is incorrect" };
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      return { success: true };
    } catch (error) {
      console.error("Error changing password:", error);
      return { success: false, message: "Something went wrong" };
    }
  };


export const deleteProfile = async (id)=>{
    

}






export const ResetPasswordOTP = async (email) => {
    try {
        await connectDb();

        const user = await User.findOne({ email });
        if (!user) return { success: false, message: "User not found" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2 style="color: #4CAF50;">Hello ${user.name},</h2>
        <p>You have requested to reset your password.</p>
        <p><strong>Your OTP is:</strong> <span style="font-size: 20px; color: #000;">${otp}</span></p>
        <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <br />
        <p style="font-size: 14px; color: #777;">If you didn’t request this, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Invoice-app" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset OTP", // ✅ Now fixed
            html: htmlTemplate,
        });

        return { success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error("Error in ResetPasswordOTP:", error);
        return { success: false, message: "Something went wrong" };
    }
};


export const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
    await connectDb();

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
        return { status: 400, message: "Invalid request." };
    }

    if (user.otp !== otp) {
        return { status: 400, message: "Incorrect OTP." };
    }

    if (user.otpExpiry < new Date()) {
        return { status: 400, message: "OTP expired." };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return { status: 200, message: "Password reset successful." };
};