import PortfolioHolding from "../models/PortfolioHolding.js";

export async function getPortfolio(req, res) {
  try {
    const holdings = await PortfolioHolding.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: holdings.length,
      data: holdings,
    });
  } catch (error) {
    console.error("Get portfolio error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load portfolio.",
    });
  }
}

export async function addPortfolioHolding(req, res) {
  try {
    const {
      coinId,
      symbol,
      name,
      image,
      quantity,
      purchasePrice,
      purchaseDate,
    } = req.body;

    if (!coinId || !symbol || !name || !quantity || !purchasePrice) {
      return res.status(400).json({
        success: false,
        message:
          "coinId, symbol, name, quantity, and purchasePrice are required.",
      });
    }

    const holding = await PortfolioHolding.create({
      userId: req.user._id,
      coinId,
      symbol,
      name,
      image: image || "",
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      purchaseDate: purchaseDate || "",
    });

    res.status(201).json({
      success: true,
      data: holding,
    });
  } catch (error) {
    console.error("Add portfolio error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add portfolio holding.",
    });
  }
}

export async function updatePortfolioHolding(req, res) {
  try {
    const { holdingId } = req.params;
    const { quantity, purchasePrice, purchaseDate } = req.body;

    if (Number(quantity) <= 0 || Number(purchasePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and purchase price must be greater than 0.",
      });
    }

    const holding = await PortfolioHolding.findOneAndUpdate(
      {
        _id: holdingId,
        userId: req.user._id,
      },
      {
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        purchaseDate: purchaseDate || "",
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: "Portfolio holding not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: holding,
    });
  } catch (error) {
    console.error("Update portfolio error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update portfolio holding.",
    });
  }
}

export async function deletePortfolioHolding(req, res) {
  try {
    const { holdingId } = req.params;

    const holding = await PortfolioHolding.findOneAndDelete({
      _id: holdingId,
      userId: req.user._id,
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: "Portfolio holding not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Portfolio holding removed.",
    });
  } catch (error) {
    console.error("Delete portfolio error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to remove portfolio holding.",
    });
  }
}

export async function clearPortfolio(req, res) {
  try {
    await PortfolioHolding.deleteMany({
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Portfolio cleared.",
    });
  } catch (error) {
    console.error("Clear portfolio error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to clear portfolio.",
    });
  }
}