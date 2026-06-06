import { useEffect, useState } from "react";
import {
  addPortfolioHolding,
  clearPortfolioHoldings,
  deletePortfolioHolding,
  getPortfolioHoldings,
  updatePortfolioHolding,
} from "../api/portfolioApi";
import { useAuth } from "../context/AuthContext";

function normalizeHolding(holding) {
  return {
    id: holding._id,
    coinId: holding.coinId,
    symbol: holding.symbol,
    name: holding.name,
    image: holding.image || "",
    quantity: Number(holding.quantity),
    purchasePrice: Number(holding.purchasePrice),
    purchaseDate: holding.purchaseDate || "",
    createdAt: holding.createdAt,
    updatedAt: holding.updatedAt,
  };
}

function usePortfolio() {
  const { isAuthenticated } = useAuth();

  const [portfolio, setPortfolio] = useState([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    async function loadPortfolio() {
      if (!isAuthenticated) {
        setPortfolio([]);
        return;
      }

      try {
        setIsPortfolioLoading(true);
        setPortfolioError("");

        const holdings = await getPortfolioHoldings();
        setPortfolio(holdings.map(normalizeHolding));
      } catch (error) {
        console.error(error);
        setPortfolioError("Unable to load portfolio.");
      } finally {
        setIsPortfolioLoading(false);
      }
    }

    loadPortfolio();
  }, [isAuthenticated]);

  async function addHolding(holding) {
    if (!isAuthenticated) {
      setPortfolioError("Please log in to save portfolio holdings.");
      return;
    }

    try {
      setPortfolioError("");

      const savedHolding = await addPortfolioHolding({
        coinId: holding.coinId,
        symbol: holding.symbol,
        name: holding.name,
        image: holding.image,
        quantity: Number(holding.quantity),
        purchasePrice: Number(holding.purchasePrice),
        purchaseDate: holding.purchaseDate,
      });

      setPortfolio((currentPortfolio) => [
        normalizeHolding(savedHolding),
        ...currentPortfolio,
      ]);
    } catch (error) {
      console.error(error);
      setPortfolioError("Unable to add portfolio holding.");
    }
  }

  async function updateHolding(holdingId, updatedValues) {
    if (!isAuthenticated) {
      setPortfolioError("Please log in to update portfolio holdings.");
      return;
    }

    try {
      setPortfolioError("");

      const updatedHolding = await updatePortfolioHolding(holdingId, {
        quantity: Number(updatedValues.quantity),
        purchasePrice: Number(updatedValues.purchasePrice),
        purchaseDate: updatedValues.purchaseDate,
      });

      setPortfolio((currentPortfolio) =>
        currentPortfolio.map((holding) =>
          holding.id === holdingId ? normalizeHolding(updatedHolding) : holding
        )
      );
    } catch (error) {
      console.error(error);
      setPortfolioError("Unable to update portfolio holding.");
    }
  }

  async function removeHolding(holdingId) {
    if (!isAuthenticated) {
      setPortfolioError("Please log in to remove portfolio holdings.");
      return;
    }

    try {
      setPortfolioError("");

      await deletePortfolioHolding(holdingId);

      setPortfolio((currentPortfolio) =>
        currentPortfolio.filter((holding) => holding.id !== holdingId)
      );
    } catch (error) {
      console.error(error);
      setPortfolioError("Unable to remove portfolio holding.");
    }
  }

  async function clearPortfolio() {
    if (!isAuthenticated) {
      setPortfolioError("Please log in to clear your portfolio.");
      return;
    }

    try {
      setPortfolioError("");

      await clearPortfolioHoldings();
      setPortfolio([]);
    } catch (error) {
      console.error(error);
      setPortfolioError("Unable to clear portfolio.");
    }
  }

  return {
    portfolio,
    isPortfolioLoading,
    portfolioError,
    addHolding,
    updateHolding,
    removeHolding,
    clearPortfolio,
  };
}

export default usePortfolio;