import mongoose from "mongoose";

const portfolioHoldingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    coinId: {
      type: String,
      required: true,
    },

    symbol: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const PortfolioHolding = mongoose.model(
  "PortfolioHolding",
  portfolioHoldingSchema
);

export default PortfolioHolding;