// import axios from "axios";
import apiClient from "./apiClient";
import { getAuthHeaders } from "./authApi";

export async function getPortfolioHoldings() {
  const response = await apiClient.get("/api/portfolio", {
    headers: getAuthHeaders(),
  });

  return response.data.data;
}

export async function addPortfolioHolding(holding) {
  const response = await apiClient.post(
    "/api/portfolio",
    {
      coinId: holding.coinId,
      symbol: holding.symbol,
      name: holding.name,
      image: holding.image || "",
      quantity: holding.quantity,
      purchasePrice: holding.purchasePrice,
      purchaseDate: holding.purchaseDate || "",
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
}

export async function updatePortfolioHolding(holdingId, updatedValues) {
  const response = await apiClient.put(
    `/api/portfolio/${holdingId}`,
    {
      quantity: updatedValues.quantity,
      purchasePrice: updatedValues.purchasePrice,
      purchaseDate: updatedValues.purchaseDate || "",
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
}

export async function deletePortfolioHolding(holdingId) {
  const response = await apiClient.delete(`/api/portfolio/${holdingId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

export async function clearPortfolioHoldings() {
  const response = await apiClient.delete("/api/portfolio", {
    headers: getAuthHeaders(),
  });

  return response.data;
}