"use server"
import connectDb from "@/db/connectDb"
import Recharge from "@/models/Rechage"
import RechargeHistory from "@/models/RechargeHistory"



export const fetchRecharge = async (userId, status) => {
  await connectDb();

  const rechrge = await Recharge.find({recordStatus: status, user: userId});

  if (!rechrge || rechrge.length === 0) {
    return { };
  }
  const safeRecharges = rechrge.map(rechrge =>rechrge.toObject({ flattenObjectIds: true })
  );


  return safeRecharges;
};



// createRecharge


export const createRecharge = async (data) => {
  try {
    await connectDb();
    let ndata = { ...data };

    // Check for existing operator
    let existingRecharge = await Recharge.findOne({
      operatorName: ndata.operatorName,
      user: ndata.user,
    });

    if (existingRecharge) {
      return { status: 400, message: "Operator Name already exists for this user" };
    }

    // Create new Recharge
    let res = await Recharge.create(ndata);

    // Create RechargeHistory
    const rechargeHistory = new RechargeHistory({
      user: res.user,                      // Correct way to access user ID
      operatorId: res._id,
      addBalance: ndata.totalBalance,
      useBalance: 0,
      description: ndata.description || "", // Safely use description
    });

    await rechargeHistory.save();

    return { status: 200, message: "Recharge created successfully" };
  } catch (error) {
    console.error("Error creating recharge:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};


export const updateRecharge = async (id, data) => {
  try {
    await connectDb();
    let ndata = { ...data };

    // Find the existing recharge
    // let existingRecharge = await Recharge.findById(id);

    // if (!existingRecharge) {
    //   return { status: 404, message: "Recharge not found" };
    // }

    // // Update the recharge
    // existingRecharge.operatorName = ndata.operatorName;
    // existingRecharge.totalBalance = ndata.totalBalance;
    // existingRecharge.remainingBalance = ndata.remainingBalance;
    // existingRecharge.previousBalance = ndata.previousBalance;
    // existingRecharge.description = ndata.description || "";
    // existingRecharge.date = ndata.date || new Date();

    // await existingRecharge.save();
    let existingRecharge = await Recharge.findOneAndUpdate(
      { _id: id },
      {
        ...ndata},
      { new: true }
    );

    return { status: 200, message: "Recharge updated successfully" };
  } catch (error) {
    console.error("Error updating recharge:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};




export const deleteRecharge = async (id) => {
  try {
    await connectDb();

    // Find the recharge by ID
    let recharge = await Recharge.findById(id);
if (!recharge) {
      return { status: 404, message: "Recharge not found" };
    }
    // Deactivate the recharge
    recharge.recordStatus = "deactivated";
    recharge.deactivatedAt = new Date();
    await recharge.save();

    await RechargeHistory.updateMany(
      { operatorId: recharge._id},
      { $set: { recordStatus: "deactivated", deactivatedAt: new Date() } }
    );
    return { status: 200, message: "Recharge deactivated successfully" };
  }
  catch (error) {
    console.error("Error deactivating recharge:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};