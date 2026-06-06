import { fetchMarketCoins } from "../services/coingeckoService.js";

const STREAM_INTERVAL = 5000;

let latestPrices = [];

function createSimulatedPriceUpdate(coin) {
  const randomChangePercent = (Math.random() - 0.5) * 0.4;
  const priceChange = coin.price * (randomChangePercent / 100);
  const updatedPrice = Math.max(coin.price + priceChange, 0);

  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    price: Number(updatedPrice.toFixed(updatedPrice >= 1 ? 2 : 6)),
    changePercent: Number(randomChangePercent.toFixed(4)),
    timestamp: new Date().toISOString(),
  };
}

async function loadInitialPrices() {
  try {
    const result = await fetchMarketCoins();

    latestPrices = result.data.slice(0, 20).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
    }));

    console.log(`Loaded ${latestPrices.length} coins for price stream`);
  } catch (error) {
    console.error("Unable to load initial prices for stream:", error.message);
    latestPrices = [];
  }
}

export async function startPriceStream(io) {
  await loadInitialPrices();

  setInterval(() => {
    if (latestPrices.length === 0) {
      return;
    }

    latestPrices = latestPrices.map((coin) => {
      const update = createSimulatedPriceUpdate(coin);

      return {
        ...coin,
        price: update.price,
      };
    });

    const updates = latestPrices.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      timestamp: new Date().toISOString(),
    }));

    io.emit("priceUpdates", updates);

    console.log(`Emitted ${updates.length} price updates`);
  }, STREAM_INTERVAL);
}