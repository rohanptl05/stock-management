import mongoose from "mongoose";


const { Schema } = mongoose;

const productHistorySchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Number },
    productQuantity: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    recordStatus: {
        type: String,
        enum: ["active", "deactivated"],
        default: "active",
    },
     deactivatedAt: { type: Date, default: null },
}, {
    timestamps: true,
});
productHistorySchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });
productHistorySchema.index({ user: 1 });
productHistorySchema.index({ productId: 1 });
productHistorySchema.index({ recordStatus: 1 });
productHistorySchema.index({ date: -1 });

const ProductHistory = mongoose.models.ProductHistory || mongoose.model("ProductHistory", productHistorySchema);

export default ProductHistory;

