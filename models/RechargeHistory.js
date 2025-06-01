
import mongoose from "mongoose";


const { Schema } = mongoose;


const rechargeHistorySchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Recharge", required: true },
    addBalance: { type: Number, default: 0, min: 0 },
    useBalance: { type: Number, default: 0, min: 0 },
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



rechargeHistorySchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });
rechargeHistorySchema.index({ user: 1 });
rechargeHistorySchema.index({ operatorId: 1 });
rechargeHistorySchema.index({ recordStatus: 1 });
// rechargeHistorySchema.index({ date: -1 });


const RechargeHistory = mongoose?.models?.RechargeHistory || mongoose.model("RechargeHistory", rechargeHistorySchema);
export default RechargeHistory;
