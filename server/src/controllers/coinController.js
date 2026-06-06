import {
  fetchCoinById,
  fetchCoinHistory,
  fetchMarketCoins,
} from "../services/coingeckoService.js";

export async function getCoins(req, res) {
  try {
    const result = await fetchMarketCoins();

    res.status(200).json({
      success: true,
      count: result.data.length,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    console.error("Market controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load market data",
    });
  }
}

export async function getCoinById(req, res) {
  try {
    const { id } = req.params;

    const result = await fetchCoinById(id);

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: "Coin not found",
      });
    }

    res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    console.error("Coin detail controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load coin details",
    });
  }
}

export async function getCoinHistory(req, res) {
  try {
    const { id } = req.params;

    const result = await fetchCoinHistory(id);

    res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    console.error("History controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load chart data",
    });
  }
}