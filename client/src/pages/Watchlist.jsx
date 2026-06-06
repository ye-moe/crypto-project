import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Star } from "lucide-react";
import useWatchlist from "../hooks/useWatchlist";
import { useAuth } from "../context/AuthContext";
import { getCoins } from "../api/cryptoApi";

function Watchlist() {
  const { isAuthenticated } = useAuth();

  const { watchlist, removeFromWatchlist, isWatchlistLoading, watchlistError } =
    useWatchlist();

  const [marketCoins, setMarketCoins] = useState([]);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    async function loadMarketCoins() {
      if (!isAuthenticated) {
        return;
      }

      try {
        setIsMarketLoading(true);
        setMarketError("");

        const coins = await getCoins();
        setMarketCoins(coins);
      } catch (error) {
        console.error(error);
        setMarketError("Unable to load live market data for watchlist.");
      } finally {
        setIsMarketLoading(false);
      }
    }

    loadMarketCoins();
  }, [isAuthenticated]);

  const enrichedWatchlist = useMemo(() => {
    return watchlist.map((savedCoin) => {
      const liveCoin = marketCoins.find(
        (coin) => coin.id === savedCoin.coinId || coin.id === savedCoin.id
      );

      return {
        ...savedCoin,
        ...liveCoin,
        id: savedCoin.id,
        coinId: savedCoin.coinId,
        name: liveCoin?.name || savedCoin.name,
        symbol: liveCoin?.symbol || savedCoin.symbol,
        image: liveCoin?.image || savedCoin.image,
      };
    });
  }, [watchlist, marketCoins]);

  function formatCurrency(value) {
    if (value === undefined || value === null) {
      return "N/A";
    }

    return `$${Number(value).toLocaleString()}`;
  }

  function formatPercent(value) {
    if (value === undefined || value === null) {
      return "N/A";
    }

    const numberValue = Number(value);

    return `${numberValue >= 0 ? "+" : ""}${numberValue.toFixed(2)}%`;
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Star size={28} />
        </div>

        <h2 className="mt-4 text-3xl font-bold">Log in to use your watchlist</h2>

        <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-400">
          Your saved coins are now stored in your database account instead of
          localStorage.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500"
        >
          Log in
        </Link>
      </section>
    );
  }

  if (isWatchlistLoading || isMarketLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 text-center shadow-lg">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="mx-auto mt-4 h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mx-auto mt-3 h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </section>
    );
  }

  if (watchlistError || marketError) {
    return (
      <section className="rounded-2xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Watchlist Error</h2>
        <p className="mt-2 text-red-700 dark:text-red-200">{watchlistError || marketError}</p>
      </section>
    );
  }

  if (watchlist.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Star size={28} />
        </div>

        <h2 className="mt-4 text-3xl font-bold">Your watchlist is empty</h2>

        <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-400">
          Add coins from the dashboard or coin detail pages to track them here.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500"
        >
          Browse Coins
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
        <h2 className="text-3xl font-bold">Watchlist</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Track coins you care about most. Saved to your database account.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-lg">
        <div className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60">
          <h3 className="text-xl font-semibold">Saved Coins</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {watchlist.length} coin{watchlist.length === 1 ? "" : "s"} saved
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-100 text-sm uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Coin</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">24h Change</th>
                <th className="px-6 py-4">Market Cap</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Remove</th>
              </tr>
            </thead>

            <tbody>
              {enrichedWatchlist.map((coin) => (
                <tr
                  key={coin.coinId || coin.id}
                  className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/coin/${coin.coinId || coin.id}`}
                      className="flex items-center gap-3"
                    >
                      {coin.image && (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}

                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{coin.name}</p>
                        <p className="text-sm uppercase text-slate-600 dark:text-slate-400">
                          {coin.symbol}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(coin.price)}
                  </td>

                  <td
                    className={
                      Number(coin.change24h) >= 0
                        ? "px-6 py-4 font-medium text-green-400"
                        : "px-6 py-4 font-medium text-red-400"
                    }
                  >
                    {formatPercent(coin.change24h)}
                  </td>

                  <td className="px-6 py-4">
                    {coin.marketCap ? `$${coin.marketCap}` : "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    {coin.volume ? `$${coin.volume}` : "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => removeFromWatchlist(coin.coinId || coin.id)}
                      className="rounded-full bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                      aria-label={`Remove ${coin.name} from watchlist`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Watchlist;