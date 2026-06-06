// import axios from "axios";
import apiClient from "./apiClient";
import { getAuthHeaders } from "./authApi";

export async function getWatchlistItems() {
  const response = await apiClient.get("/api/watchlist", {
    headers: getAuthHeaders(),
  });

  return response.data.data;
}

export async function addWatchlistItem(coin) {
  const response = await apiClient.post(
    "/api/watchlist",
    {
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image || "",
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
}

export async function deleteWatchlistItem(coinId) {
  const response = await apiClient.delete(`/api/watchlist/${coinId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
}