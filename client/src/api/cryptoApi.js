// import axios from "axios";
import apiClient from "./apiClient";

export async function getCoins() {
  const response = await apiClient.get("/api/coins");
  return response.data.data;
}

export async function getCoinById(id) {
  const response = await apiClient.get(`/api/coins/${id}`);
  return response.data.data;
}

export async function getCoinHistory(id) {
  const response = await apiClient.get(`/api/coins/${id}/history`);
  return response.data.data;
}