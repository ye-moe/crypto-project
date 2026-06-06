import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

watchlistItemSchema.index({ userId: 1, coinId: 1 }, { unique: true });

const WatchlistItem = mongoose.model("WatchlistItem", watchlistItemSchema);

export default WatchlistItem;