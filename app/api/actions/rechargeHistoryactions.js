"use server";
import RechargeHistory from "@/models/RechargeHistory"
import connectDb from "@/db/connectDb";
import Recharge from "@/models/Rechage";


export const fetchRechargeHistory = async (Id, status) => {
    await connectDb();

    const rechrge = await RechargeHistory.find({ recordStatus: status, operatorId:Id });

    if (!rechrge || rechrge.length === 0) {
        return {};
    }
    const safeRecharges = rechrge.map(rechrge => rechrge.toObject({ flattenObjectIds: true })
    );

    return safeRecharges;
};


// createRechargeHistory
export const createRechargeHistory = async (data) => {
  await connectDb();

  const rechargeHistory = new RechargeHistory({
    user: data.user,
    operatorId: data.operatorId,
    addBalance: data.addBalance,
    useBalance: data.useBalance,
    description: data.description,
    date: data.date || new Date(),
  });

  await rechargeHistory.save();

   
  const aggregates = await RechargeHistory.aggregate([
    {
      $match: {
        operatorId: rechargeHistory.operatorId,
        recordStatus: "active",
      },
    },
    {
      $group: {
        _id: "$operatorId",
        totalAddBalance: { $sum: "$addBalance" },
        totalUseBalance: { $sum: "$useBalance" },
      },
    },
  ]);

  const { totalAddBalance = 0, totalUseBalance = 0 } = aggregates[0] || {};
  const finalBalance = totalAddBalance - totalUseBalance;

  
  await Recharge.findByIdAndUpdate(
    rechargeHistory.operatorId,
    { totalBalance: totalAddBalance, remainingBalance: finalBalance },
    { new: true }
  );



  return { status: 200, message: "Balance recorded successfully." };
};





// editRechargeHistory;
export const editRechargeHistory = async (id, data) => {
    await connectDb();
    const ndata = {...data}
    const rechargeHistory = await RechargeHistory.findByIdAndUpdate(id, {...ndata}, { new: true });
    if (!rechargeHistory) {
        return { status: 404, message: "Recharge history not found." };
    }



  const aggregates = await RechargeHistory.aggregate([
    {
      $match: {
        operatorId: rechargeHistory.operatorId,
        recordStatus: "active",
      },
    },
    {
      $group: {
        _id: "$operatorId",
        totalAddBalance: { $sum: "$addBalance" },
        totalUseBalance: { $sum: "$useBalance" },
      },
    },
  ]);

  const { totalAddBalance = 0, totalUseBalance = 0 } = aggregates[0] || {};
  const finalBalance = totalAddBalance - totalUseBalance;

 
  await Recharge.findByIdAndUpdate(
    rechargeHistory.operatorId,
    { totalBalance: totalAddBalance, remainingBalance: finalBalance },
    { new: true }
  );

   
    return { status: 200, message: "Recharge history updated successfully." };
}



// deleteRechargeHistory
export const deleteRechargeHistory = async (id) => {
    await connectDb();
    const rechargeHistory = await RechargeHistory.findByIdAndUpdate(id, { recordStatus: "deactivated",deactivatedAt:new Date() }, { new: true });
    if (!rechargeHistory) {
        return { status: 404, message: "Recharge history not found." };
    }


    
  const aggregates = await RechargeHistory.aggregate([
    {
      $match: {
        operatorId: rechargeHistory.operatorId,
        recordStatus: "active",
      },
    },
    {
      $group: {
        _id: "$operatorId",
        totalAddBalance: { $sum: "$addBalance" },
        totalUseBalance: { $sum: "$useBalance" },
      },
    },
  ]);

  const { totalAddBalance = 0, totalUseBalance = 0 } = aggregates[0] || {};
  const finalBalance = totalAddBalance - totalUseBalance;

 
  await Recharge.findByIdAndUpdate(
    rechargeHistory.operatorId,
    { totalBalance: totalAddBalance, remainingBalance: finalBalance },
    { new: true }
  );

    return { status: 200, message: "Recharge history deleted successfully." };
}



export const DeActiveRechargeHistory = async (id) => {
  await connectDb();
  try {
    const rechargeHistories = await RechargeHistory.find({
      user: id,
      recordStatus: "deactivated"
    }).lean();

    if (!rechargeHistories.length) return [];

    const rechargeIds = rechargeHistories.map(r => r.operatorId);

    const recharges = await Recharge.find({
      _id: { $in: rechargeIds }
    }).select("operatorName").lean();

    const rechargeMap = {};
    for (let r of recharges) {
      rechargeMap[r._id.toString()] = r.operatorName || null;
    }

    
    const safeRecharges = rechargeHistories.map(history => ({
      _id: history._id?.toString(),
      user: history.user?.toString(),
      operatorId: history.operatorId?.toString(),
      addBalance: history.addBalance,
      useBalance: history.useBalance,
      
      operatorName: rechargeMap[history.operatorId?.toString()] || "Unknown",
    }));

    return safeRecharges;
  } catch (error) {
    console.error("Fetch error:", error);
    return { status: 500, message: "Error fetching deactivated recharge history." };
  }
};


export const RestoreRecharge = async (id) => {
  await connectDb();
  try {
    const rechargeHistory = await RechargeHistory.findOne({ _id: id });
    if (!rechargeHistory)
      return { status: 404, message: "Recharge history not found." };

    
    rechargeHistory.recordStatus = "active";
    rechargeHistory.deactivatedAt = null;
    await rechargeHistory.save();

    
    await Recharge.updateOne(
      { _id: rechargeHistory.operatorId },
      {
        $set: {
          recordStatus: "active",
          deactivatedAt: null,
        },
      }
    );

     const aggregates = await RechargeHistory.aggregate([
    {
      $match: {
        operatorId: rechargeHistory.operatorId,
        recordStatus: "active",
      },
    },
    {
      $group: {
        _id: "$operatorId",
        totalAddBalance: { $sum: "$addBalance" },
        totalUseBalance: { $sum: "$useBalance" },
      },
    },
  ]);

  const { totalAddBalance = 0, totalUseBalance = 0 } = aggregates[0] || {};
  const finalBalance = totalAddBalance - totalUseBalance;

  
  await Recharge.findByIdAndUpdate(
    rechargeHistory.operatorId,
    { totalBalance: totalAddBalance, remainingBalance: finalBalance },
    { new: true }
  );

    
    return {success: true,massege:"Succesfully Restore" };
  } catch (error) {
    console.error("Restore error:", error);
    return { status: 500, message: "Error restoring recharge history." };
  }
};
