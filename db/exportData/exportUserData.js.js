
import connectDB from "@/db/connectDb";
import User from "@/models/User";
import ExtraExpense from "@/models/Extraexpenses";
import Invoice from "@/models/Invoice";
import ProductHistory from "@/models/ProductHistory";
import Product from "@/models/Products";
import Recharge from "@/models/Rechage";
import RechargeHistory from "@/models/RechargeHistory";



export async function exportUserData(userId) {
  await connectDB();

  const [users,  extraExpenses, invoices,products,producthistorys,recharges,rechagehistorys ] = await Promise.all([
    User.find({ _id: userId }).select("-__v -password -email"),
    ExtraExpense.find({ user: userId }).select("-__v"),
    Invoice.find({ user: userId }).select("-__v"),
    Product.find({ user: userId }).select("-__v"),
    ProductHistory.find({ user: userId }).select("-__v"),
    Recharge.find({ user: userId }).select("-__v"),
    RechargeHistory.find({ user: userId }).select("-__v"),
   
  ]);

  return {
    users: users.map((doc) => doc.toObject({ flattenObjectIds: true })),
    extraExpenses: extraExpenses.map((doc) => doc.toObject({ flattenObjectIds: true })),
    invoices: invoices.map((doc) => doc.toObject({ flattenObjectIds: true })),
    products: products.map((doc) => doc.toObject({ flattenObjectIds: true })),
    producthistorys: producthistorys.map((doc) => doc.toObject({ flattenObjectIds: true })),
    recharges: recharges.map((doc) => doc.toObject({ flattenObjectIds: true })),
    rechagehistorys: rechagehistorys.map((doc) => doc.toObject({ flattenObjectIds: true })),
   
  };
}
