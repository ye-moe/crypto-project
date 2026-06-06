import { useEffect, useState } from "react";
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlistItems,
} from "../api/watchlistApi";
import { useAuth } from "../context/AuthContext";

function normalizeWatchlistItem(item) {
  return {
    id: item.coinId,
    databaseId: item._id,
    coinId: item.coinId,
    symbol: item.symbol,
    name: item.name,
    image: item.image || "",
  };
}

function useWatchlist() {
  const { isAuthenticated } = useAuth();

  const [watchlist, setWatchlist] = useState([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");

  useEffect(() => {
    async function loadWatchlist() {
      if (!isAuthenticated) {
        setWatchlist([]);
        return;
      }

      try {
        setIsWatchlistLoading(true);
        setWatchlistError("");

        const items = await getWatchlistItems();
        setWatchlist(items.map(normalizeWatchlistItem));
      } catch (error) {
        console.error(error);
        setWatchlistError("Unable to load watchlist.");
      } finally {
        setIsWatchlistLoading(false);
      }
    }

    loadWatchlist();
  }, [isAuthenticated]);

  function isInWatchlist(coinId) {
    return watchlist.some((coin) => coin.id === coinId || coin.coinId === coinId);
  }

  async function addToWatchlist(coin) {
    if (!isAuthenticated) {
      setWatchlistError("Please log in to save coins to your watchlist.");
      return;
    }

    try {
      setWatchlistError("");

      const savedItem = await addWatchlistItem(coin);
      const normalizedItem = normalizeWatchlistItem(savedItem);

      setWatchlist((currentWatchlist) => {
        const alreadyExists = currentWatchlist.some(
          (item) => item.coinId === normalizedItem.coinId
        );

        if (alreadyExists) {
          return currentWatchlist;
        }

        return [...currentWatchlist, normalizedItem];
      });
    } catch (error) {
      console.error(error);
      setWatchlistError("Unable to add coin to watchlist.");
    }
  }

  async function removeFromWatchlist(coinId) {
    if (!isAuthenticated) {
      setWatchlistError("Please log in to manage your watchlist.");
      return;
    }

    try {
      setWatchlistError("");

      await deleteWatchlistItem(coinId);

      setWatchlist((currentWatchlist) =>
        currentWatchlist.filter(
          (coin) => coin.id !== coinId && coin.coinId !== coinId
        )
      );
    } catch (error) {
      console.error(error);
      setWatchlistError("Unable to remove coin from watchlist.");
    }
  }

  async function toggleWatchlist(coin) {
    if (isInWatchlist(coin.id)) {
      await removeFromWatchlist(coin.id);
    } else {
      await addToWatchlist(coin);
    }
  }

  return {
    watchlist,
    isWatchlistLoading,
    watchlistError,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}

export default useWatchlist;