import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCoinById, getCoinHistory } from "../api/cryptoApi";
import CoinDetailsSkeleton from "../components/CoinDetailsSkeleton";
import useWatchlist from "../hooks/useWatchlist";
import useRealtimePrices from "../hooks/useRealtimePrices";

function CoinDetails() {
  const { id } = useParams();

  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const { priceUpdates, isSocketConnected } = useRealtimePrices();

  useEffect(() => {
    async function loadCoinDetails() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const coinData = await getCoinById(id);
        const historyData = await getCoinHistory(id);

        setCoin(coinData);
        setChartData(historyData);
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load coin details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCoinDetails();
  }, [id]);

  if (isLoading) {
    return <CoinDetailsSkeleton />;
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">
          Coin Error
        </h2>
        <p className="mt-2 text-red-700 dark:text-red-200">{errorMessage}</p>
        <p className="mt-4 text-sm text-red-700/80 dark:text-red-700">
          Check that this coin exists and your backend server is running.
        </p>
      </section>
    );
  }

  if (!coin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">Coin not found</h2>
      </div>
    );
  }

  const realtimeUpdate = priceUpdates[coin.id];

  const displayCoin = realtimeUpdate
    ? {
        ...coin,

        price: realtimeUpdate.price,

        lastUpdated: realtimeUpdate.timestamp,
      }
    : coin;

  const priceChangeIsPositive = displayCoin.change24h >= 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {displayCoin.image && (
                <img
                  src={displayCoin.image}
                  alt={displayCoin.name}
                  className="h-12 w-12 rounded-full"
                />
              )}

              <div>
                <p className="text-sm uppercase text-slate-600 dark:text-slate-400">
                  {displayCoin.symbol}
                </p>
                <h2 className="mt-1 text-4xl font-bold">{displayCoin.name}</h2>
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold">
              ${displayCoin.price.toLocaleString()}
            </p>

            {realtimeUpdate && (
              <p className="mt-1 text-sm text-blue-300">
                Live price updated through Socket.IO
              </p>
            )}

            <p
              className={
                priceChangeIsPositive
                  ? "mt-2 text-green-400"
                  : "mt-2 text-red-400"
              }
            >
              {priceChangeIsPositive ? "+" : ""}
              {displayCoin.change24h}% today
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleWatchlist(displayCoin)}
            className={
              isInWatchlist(displayCoin.id)
                ? "mt-5 flex w-fit items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 font-medium text-yellow-400 transition hover:bg-yellow-500/20"
                : "mt-5 flex w-fit items-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2 font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-300 hover:text-yellow-400"
            }
          >
            <Star
              size={18}
              fill={isInWatchlist(displayCoin.id) ? "currentColor" : "none"}
            />
            {isInWatchlist(displayCoin.id)
              ? "Remove from Watchlist"
              : "Add to Watchlist"}
          </button>

          <div className="grid grid-cols-2 gap-4 md:min-w-80">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Market Cap
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                ${displayCoin.marketCap}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Volume
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                ${displayCoin.volume}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">7-Day Price Chart</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Historical price data from the Express API.
            </p>
          </div>

          <span
            className={
              priceChangeIsPositive
                ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400"
                : "w-fit rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
            }
          >
            {priceChangeIsPositive ? "Uptrend" : "Downtrend"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={
              priceChangeIsPositive
                ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400"
                : "w-fit rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
            }
          >
            {priceChangeIsPositive ? "Uptrend" : "Downtrend"}
          </span>

          <span
            className={
              isSocketConnected
                ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400"
                : "w-fit rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
            }
          >
            {isSocketConnected ? "Live connected" : "Live offline"}
          </span>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e5e7eb",
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default CoinDetails;
