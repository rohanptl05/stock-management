
import mongoose from "mongoose";


const { Schema } = mongoose;


const rechargeSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  operatorName: { type: String, required: true ,trim : true},
  totalBalance: { type: Number, required: true, min: 0 },
  remainingBalance: { type: Number, default: 0, min: 0 },
  previousBalance: { type: Number, default: 0, min: 0 },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  recordStatus: {
    type: String,
    enum: ["active", "deactivated"],
    default: "active",
  },
  deactivatedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});



rechargeSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 }); 
rechargeSchema.index({ user: 1 });
rechargeSchema.index({ operatorName: 1 });
rechargeSchema.index({ recordStatus: 1 });
rechargeSchema.index({ date: -1 }); 


const Recharge = mongoose.models.Recharge || mongoose.model("Recharge", rechargeSchema);
export default Recharge;
