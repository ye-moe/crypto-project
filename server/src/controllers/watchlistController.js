import WatchlistItem from "../models/WatchlistItem.js";

export async function getWatchlist(req, res) {
  try {
    const items = await WatchlistItem.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get watchlist error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load watchlist.",
    });
  }
}

export async function addWatchlistItem(req, res) {
  try {
    const { coinId, symbol, name, image } = req.body;

    if (!coinId || !symbol || !name) {
      return res.status(400).json({
        success: false,
        message: "coinId, symbol, and name are required.",
      });
    }

    const item = await WatchlistItem.findOneAndUpdate(
      {
        userId: req.user._id,
        coinId,
      },
      {
        userId: req.user._id,
        coinId,
        symbol,
        name,
        image: image || "",
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Add watchlist error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add item to watchlist.",
    });
  }
}

export async function deleteWatchlistItem(req, res) {
  try {
    const { coinId } = req.params;

    const deletedItem = await WatchlistItem.findOneAndDelete({
      userId: req.user._id,
      coinId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Watchlist item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Watchlist item removed.",
    });
  } catch (error) {
    console.error("Delete watchlist error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to remove watchlist item.",
    });
  }
}