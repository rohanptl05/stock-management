import mongoose from "mongoose";

const { Schema } = mongoose;

const ExtraExpenseSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: [0, "Payment received must be a positive number"],
      set: (value) =>
        mongoose.Types.Decimal128.fromString(parseFloat(value).toFixed(2)),
      get: (value) => parseFloat(value.toString())
    },
    date: {
      type: Date,
      default: Date.now
    },
    expensetype: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    recordStatus: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active"
    },
    deactivatedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

ExtraExpenseSchema.index({ deactivatedAt: 1 }, { expireAfterSeconds: 7776000 });
ExtraExpenseSchema.index({ user: 1 });               // Quickly find user's expenses
ExtraExpenseSchema.index({ recordStatus: 1 });       // Quickly filter active expenses
ExtraExpenseSchema.index({ date: -1 });              // Quickly sort by newest first
ExtraExpenseSchema.index({ expensetype: 1 });        // Quickly filter by type (e.g., "Fuel", "Rent")


const ExtraExpense = mongoose.models.ExtraExpense || mongoose.model("ExtraExpense", ExtraExpenseSchema);

export default ExtraExpense;
