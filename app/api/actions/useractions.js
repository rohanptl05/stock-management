"use server"

import connectDb from "@/db/connectDb"
import User from "@/models/User"
import bcrypt from "bcryptjs";



export const fetchuser = async (email) => {
    await connectDb();

    let user = await User.findOne({ email });
    if (!user) {
        return { error: "User not found" };
    }

    return user.toObject({ flattenObjectIds: true });
};




export const updateProfile = async (data, oldemail) => {
    await connectDb();

    let ndata = { ...data };


    // If the email is being updated, ensure the new email is not already in use
    if (oldemail !== ndata.email) {
        let userExists = await User.findOne({ email: ndata.email });

        if (userExists) {
            return { error: "This email is already in use" };
        }

        // Update user email
        await User.findOneAndUpdate({ email: oldemail }, { email: ndata.email, ...ndata });

        // Update the Payments table where this email is used
        // await Payment.updateMany({ to_user: oldemail }, { to_user: ndata.email });
    } else {
        // Update the user details without changing the email
        await User.findOneAndUpdate({ email: ndata.email }, ndata);
    }

    return { success: "Profile updated successfully" };


}

export const Newusers = async (name, email, password) => {
    await connectDb();
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email : normalizedEmail });

    if (existingUser) {
        return { status: 400, error: "Email is already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Here you should actually save new user in the database, you're missing this step!
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

    // Find the user by ID and update the logo field to null
    const updatedUser = await User.findByIdAndUpdate(
        id,
        {$set:{
            companylogo: null } // Set the companylogo field to null
        }
    );

    if (!updatedUser) {
        return { error: "User not found" };
    }

    return { success: "Logo deleted successfully" };
}



export const changeUserPassword = async (email, oldPassword, newPassword) => {
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


