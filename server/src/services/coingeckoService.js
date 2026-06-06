import axios from "axios";
import { mockCoins } from "../data/mockCoins.js";
import { mockChartData } from "../data/mockChartData.js";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
// const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3-broken"; testing mock data

const CACHE_DURATION = 60 * 1000; // 1 minute

const cache = {
  marketCoins: {
    data: null,
    timestamp: 0,
  },
  coinHistory: {},
};

function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

function formatLargeNumber(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toString();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeCoin(coin) {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.image,
    price: coin.current_price ?? 0,
    change24h: coin.price_change_percentage_24h ?? 0,
    marketCap: formatLargeNumber(coin.market_cap),
    marketCapValue: coin.market_cap ?? 0,
    volume: formatLargeNumber(coin.total_volume),
    volumeValue: coin.total_volume ?? 0,
    rank: coin.market_cap_rank,
  };
}

function getFallbackMarketCoins() {
  return mockCoins.map((coin, index) => ({
    ...coin,
    image: coin.image || "",
    rank: coin.rank || index + 1,
  }));
}

function getFallbackCoinById(id) {
  const fallbackCoins = getFallbackMarketCoins();

  return fallbackCoins.find((coin) => coin.id === id);
}

function getFallbackCoinHistory(id) {
  return mockChartData[id] || [];
}

export async function fetchMarketCoins() {
  if (cache.marketCoins.data && isCacheValid(cache.marketCoins.timestamp)) {
    console.log("Using cached market coins");

    return {
      data: cache.marketCoins.data,
      source: "cache",
    };
  }

  try {
    console.log("Fetching fresh market coins from CoinGecko");

    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 8000,
    });

    const normalizedCoins = response.data.map(normalizeCoin);

    cache.marketCoins = {
      data: normalizedCoins,
      timestamp: Date.now(),
    };

    return {
      data: normalizedCoins,
      source: "coingecko",
    };
  } catch (error) {
    console.error("CoinGecko market request failed:", error.message);

    if (cache.marketCoins.data) {
      console.log("Using expired cached market coins");

      return {
        data: cache.marketCoins.data,
        source: "expired-cache",
      };
    }

    console.log("Using mock market fallback data");

    return {
      data: getFallbackMarketCoins(),
      source: "mock",
    };
  }
}

export async function fetchCoinById(id) {
  const marketResult = await fetchMarketCoins();

  const coin = marketResult.data.find((coin) => coin.id === id);

  if (coin) {
    return {
      data: coin,
      source: marketResult.source,
    };
  }

  return {
    data: getFallbackCoinById(id),
    source: "mock",
  };
}

export async function fetchCoinHistory(id) {
  const cachedHistory = cache.coinHistory[id];

  if (cachedHistory && isCacheValid(cachedHistory.timestamp)) {
    console.log(`Using cached history for ${id}`);

    return {
      data: cachedHistory.data,
      source: "cache",
    };
  }

  try {
    console.log(`Fetching fresh history for ${id} from CoinGecko`);

    const response = await axios.get(
      `${COINGECKO_BASE_URL}/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: 7,
        },
        timeout: 8000,
      }
    );

    const sampledPrices = response.data.prices.filter(
      (_, index) => index % 12 === 0
    );

    const chartData = sampledPrices.map((pricePoint) => {
      const [timestamp, price] = pricePoint;

      return {
        date: formatDate(timestamp),
        price: Number(price.toFixed(2)),
      };
    });

    cache.coinHistory[id] = {
      data: chartData,
      timestamp: Date.now(),
    };

    return {
      data: chartData,
      source: "coingecko",
    };
  } catch (error) {
    console.error(`CoinGecko history request failed for ${id}:`, error.message);

    if (cachedHistory) {
      console.log(`Using expired cached history for ${id}`);

      return {
        data: cachedHistory.data,
        source: "expired-cache",
      };
    }

    console.log(`Using mock history fallback for ${id}`);

    return {
      data: getFallbackCoinHistory(id),
      source: "mock",
    };
  }
}