import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpDown, Star } from "lucide-react";
import { getCoins } from "../api/cryptoApi";
import DashboardSkeleton from "../components/DashboardSkeleton";
import useWatchlist from "../hooks/useWatchlist";
import useRealtimePrices from "../hooks/useRealtimePrices";

function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({
    key: "marketCapValue",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const { priceUpdates, isSocketConnected } = useRealtimePrices();

  useEffect(() => {
    async function loadCoins() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const coinData = await getCoins();
        setCoins(coinData);
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load crypto market data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCoins();
  }, []);

  const coinsWithRealtimePrices = coins.map((coin) => {
    const realtimeUpdate = priceUpdates[coin.id];

    if (!realtimeUpdate) {
      return coin;
    }

    return {
      ...coin,
      price: realtimeUpdate.price,
      lastUpdated: realtimeUpdate.timestamp,
    };
  });

  const filteredCoins = coinsWithRealtimePrices.filter((coin) => {
    const coinName = coin.name.toLowerCase();
    const coinSymbol = coin.symbol.toLowerCase();
    const search = searchTerm.toLowerCase();

    return coinName.includes(search) || coinSymbol.includes(search);
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }

    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedCoins.length / coinsPerPage);

  const startIndex = (currentPage - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;

  const currentCoins = sortedCoins.slice(startIndex, endIndex);

  function handleSort(key) {
    setCurrentPage(1);

    setSortConfig((currentSort) => {
      const isSameKey = currentSort.key === key;

      return {
        key,
        direction:
          isSameKey && currentSort.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  function getSortLabel(key) {
    if (sortConfig.key !== key) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Backend Error</h2>
        <p className="mt-2 text-red-700 dark:text-red-200">{errorMessage}</p>
        <p className="mt-4 text-sm text-red-700/80 dark:text-red-200/80">
          Make sure your Express server is running on http://localhost:5001.
        </p>
      </section>
    );
  }

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Market Dashboard</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Track top cryptocurrencies, market movement, and real-time price
              changes from one responsive dashboard.
            </p>
          </div>

          <div
            className={
              isSocketConnected
                ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400"
                : "w-fit rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
            }
          >
            {isSocketConnected
              ? "Live prices connected"
              : "Live prices offline"}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <div>
            <h3 className="text-xl font-semibold">Top Cryptocurrencies</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Search by coin name or symbol. Click column headers to sort.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500"
            />

            <input
              type="text"
              placeholder="Search Bitcoin, ETH..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-100 text-sm uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Watch</th>
                <th className="px-6 py-4">Coin</th>

                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="flex items-center gap-2 hover:text-slate-950 dark:text-white"
                  >
                    Price{getSortLabel("price")}
                    <ArrowUpDown size={14} />
                  </button>
                </th>

                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort("change24h")}
                    className="flex items-center gap-2 hover:text-slate-950 dark:text-white"
                  >
                    24h Change{getSortLabel("change24h")}
                    <ArrowUpDown size={14} />
                  </button>
                </th>

                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort("marketCapValue")}
                    className="flex items-center gap-2 hover:text-slate-950 dark:text-white"
                  >
                    Market Cap{getSortLabel("marketCapValue")}
                    <ArrowUpDown size={14} />
                  </button>
                </th>

                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort("volumeValue")}
                    className="flex items-center gap-2 hover:text-slate-950 dark:text-white"
                  >
                    Volume{getSortLabel("volumeValue")}
                    <ArrowUpDown size={14} />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {currentCoins.length > 0 ? (
                currentCoins.map((coin) => (
                  <tr
                    key={coin.id}
                    className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            alert(
                              "Please log in to save coins to your watchlist.",
                            );
                            return;
                          }

                          toggleWatchlist(coin);
                        }}
                        className={
                          isInWatchlist(coin.id)
                            ? "rounded-full bg-yellow-500/10 p-2 text-yellow-400 transition hover:bg-yellow-500/20"
                            : "rounded-full bg-slate-200 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400 transition hover:bg-slate-300 hover:text-yellow-400"
                        }
                        aria-label={
                          isInWatchlist(coin.id)
                            ? `Remove ${coin.name} from watchlist`
                            : `Add ${coin.name} to watchlist`
                        }
                      >
                        <Star
                          size={18}
                          fill={
                            isInWatchlist(coin.id) ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/coin/${coin.id}`}
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
                          <p className="font-semibold text-slate-950 dark:text-white">
                            {coin.name}
                          </p>
                          <p className="text-sm uppercase text-slate-500 dark:text-slate-400">
                            {coin.symbol}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      <div>
                        <p
                          className={
                            priceUpdates[coin.id] ? "text-blue-300" : ""
                          }
                        >
                          ${coin.price.toLocaleString()}
                        </p>

                        {coin.lastUpdated && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Live</p>
                        )}
                      </div>
                    </td>

                    <td
                      className={
                        coin.change24h >= 0
                          ? "px-6 py-4 font-medium text-green-400"
                          : "px-6 py-4 font-medium text-red-400"
                      }
                    >
                      {coin.change24h >= 0 ? "+" : ""}
                      {coin.change24h}%
                    </td>

                    <td className="px-6 py-4">${coin.marketCap}</td>
                    <td className="px-6 py-4">${coin.volume}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-600 dark:text-slate-400"
                  >
                    No coins found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedCoins.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedCoins.length)}{" "}
              of {sortedCoins.length} coins
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Previous
              </button>

              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
