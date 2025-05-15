import mongoose from "mongoose";

const { Schema } = mongoose;


const productSchema = new Schema({
    productId: { type: Number},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User",required: true},
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true, min: 0 },
    productQuantity: { type: Number, required: true, min: 1 },
    productDescription: { type: String, default: "N/A" },
    productImage: { type: String, default: "N/A" },
    productCategory: { type: String, default: "N/A" },
    productBrand: { type: String, default: "N/A" },
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
    toObject: { getters: true }
});


productSchema.pre("save", async function (next) {
    try {
      if (!this.productId) {
        const lastProduct = await this.constructor
          .findOne({ user: this.user }) 
          .sort({ productId: -1 })
          .lean();
  
        this.productId = lastProduct?.productId ? lastProduct.productId + 1 : 1;
      }
      if (this.isNew) {
        this.date = new Date();
      }
    } catch (error) {
      console.error("Error in invoice pre-save middleware:", error);
      return next(error);
    }
  });
  



productSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });
productSchema.index({ user: 1 });
productSchema.index({ productName: 1 });
productSchema.index({ productId: 1 });
productSchema.index({ recordStatus: 1 });
productSchema.index({ date: -1 });


const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;