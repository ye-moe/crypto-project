// import axios from "axios";
import apiClient from "./apiClient";

export function getStoredToken() {
  return localStorage.getItem("cryptopulse_token");
}

export function setStoredToken(token) {
  localStorage.setItem("cryptopulse_token", token);
}

export function removeStoredToken() {
  localStorage.removeItem("cryptopulse_token");
}

export function getAuthHeaders() {
  const token = getStoredToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function registerUser(formData) {
  const response = await apiClient.post("/api/auth/register", formData);
  return response.data;
}

export async function loginUser(formData) {
  const response = await apiClient.post("/api/auth/login", formData);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/api/auth/me", {
    headers: getAuthHeaders(),
  });

  return response.data.user;
}