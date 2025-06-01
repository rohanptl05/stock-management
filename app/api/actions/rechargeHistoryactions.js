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

// console.log(safeRecharges, "safeRecharges");
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

    // Update the operator's balance
    // 2. Aggregate balances only from active records
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

  // 3. Update the operator's balance
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



     // Update the operator's balance
    // 2. Aggregate balances only from active records
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

  // 3. Update the operator's balance
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


     // Update the operator's balance
    // 2. Aggregate balances only from active records
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

  // 3. Update the operator's balance
  await Recharge.findByIdAndUpdate(
    rechargeHistory.operatorId,
    { totalBalance: totalAddBalance, remainingBalance: finalBalance },
    { new: true }
  );

    return { status: 200, message: "Recharge history deleted successfully." };
}
