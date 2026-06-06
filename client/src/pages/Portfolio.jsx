import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Wallet,
  Plus,
  AlertCircle,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getCoins } from "../api/cryptoApi";
import usePortfolio from "../hooks/usePortfolio";

function Portfolio() {
  const { isAuthenticated } = useAuth();

  const {
    portfolio,
    isPortfolioLoading,
    portfolioError,
    addHolding,
    updateHolding,
    removeHolding,
    clearPortfolio,
  } = usePortfolio();

  const [coins, setCoins] = useState([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingHoldingId, setEditingHoldingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editPurchaseDate, setEditPurchaseDate] = useState("");

  const chartColors = [
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#a855f7",
    "#14b8a6",
    "#f97316",
    "#ec4899",
  ];

  useEffect(() => {
    async function loadCoins() {
      try {
        setIsLoadingCoins(true);
        setErrorMessage("");

        const coinData = await getCoins();
        setCoins(coinData);

        if (coinData.length > 0) {
          setSelectedCoinId(coinData[0].id);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load coins for portfolio simulator.");
      } finally {
        setIsLoadingCoins(false);
      }
    }

    loadCoins();
  }, []);

  const selectedCoin = coins.find((coin) => coin.id === selectedCoinId);

  const portfolioWithCurrentPrices = portfolio.map((holding) => {
    const liveCoin = coins.find((coin) => coin.id === holding.coinId);

    const currentPrice = liveCoin?.price ?? 0;
    const totalCost = holding.quantity * holding.purchasePrice;
    const currentValue = holding.quantity * currentPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercent =
      totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      totalCost,
      currentValue,
      profitLoss,
      profitLossPercent,
    };
  });

  const totals = useMemo(() => {
    return portfolioWithCurrentPrices.reduce(
      (summary, holding) => {
        summary.totalCost += holding.totalCost;
        summary.currentValue += holding.currentValue;
        summary.profitLoss += holding.profitLoss;
        return summary;
      },
      {
        totalCost: 0,
        currentValue: 0,
        profitLoss: 0,
      },
    );
  }, [portfolioWithCurrentPrices]);

  const totalProfitLossPercent =
    totals.totalCost > 0 ? (totals.profitLoss / totals.totalCost) * 100 : 0;

  const allocationData = useMemo(() => {
    const groupedHoldings = portfolioWithCurrentPrices.reduce(
      (groups, holding) => {
        if (!groups[holding.coinId]) {
          groups[holding.coinId] = {
            coinId: holding.coinId,
            name: holding.name,
            symbol: holding.symbol,
            value: 0,
          };
        }

        groups[holding.coinId].value += holding.currentValue;

        return groups;
      },
      {},
    );

    return Object.values(groupedHoldings)
      .filter((holding) => holding.value > 0)
      .map((holding) => ({
        ...holding,
        percentage:
          totals.currentValue > 0
            ? (holding.value / totals.currentValue) * 100
            : 0,
      }));
  }, [portfolioWithCurrentPrices, totals.currentValue]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedCoin) {
      return;
    }

    if (Number(quantity) <= 0 || Number(purchasePrice) <= 0) {
      setErrorMessage("Quantity and purchase price must be greater than 0.");
      return;
    }

    await addHolding({
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      image: selectedCoin.image,
      quantity,
      purchasePrice,
      purchaseDate,
    });

    setQuantity("");
    setPurchasePrice("");
    setPurchaseDate(getTodayDate());
    setErrorMessage("");
  }

  function startEditingHolding(holding) {
    setEditingHoldingId(holding.id);
    setEditQuantity(String(holding.quantity));
    setEditPurchasePrice(String(holding.purchasePrice));
    setEditPurchaseDate(holding.purchaseDate || "");
    setErrorMessage("");
  }

  function cancelEditingHolding() {
    setEditingHoldingId(null);
    setEditQuantity("");
    setEditPurchasePrice("");
    setEditPurchaseDate("");
  }

  async function saveEditedHolding(holdingId) {
    if (Number(editQuantity) <= 0 || Number(editPurchasePrice) <= 0) {
      setErrorMessage(
        "Edited quantity and purchase price must be greater than 0.",
      );
      return;
    }

    await updateHolding(holdingId, {
      quantity: editQuantity,
      purchasePrice: editPurchasePrice,
      purchaseDate: editPurchaseDate,
    });

    cancelEditingHolding();
    setErrorMessage("");
  }

  function formatCurrency(value) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Wallet size={28} />
        </div>

        <h2 className="mt-4 text-3xl font-bold">
          Log in to use your portfolio
        </h2>

        <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-400">
          Your simulated holdings are now saved to your database account instead
          of localStorage.
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


  if (isLoadingCoins || isPortfolioLoading) {
    return (
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
          <div className="h-32 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
          <div className="h-32 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Portfolio Simulator</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Track simulated crypto holdings using live market prices from your
              backend API. The data is saved locally in your browser for now.
            </p>
          </div>

          {portfolio.length > 0 && (
            <button
              type="button"
              onClick={clearPortfolio}
              className="w-fit rounded-xl border border-red-500/40 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-500/10"
            >
              Clear Portfolio
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Invested</p>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totals.totalCost)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">Current Value</p>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totals.currentValue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Profit/Loss</p>
          <p
            className={
              totals.profitLoss >= 0
                ? "mt-2 text-2xl font-bold text-green-400"
                : "mt-2 text-2xl font-bold text-red-400"
            }
          >
            {formatCurrency(totals.profitLoss)}
          </p>
          <p
            className={
              totals.profitLoss >= 0
                ? "mt-1 text-sm text-green-400"
                : "mt-1 text-sm text-red-400"
            }
          >
            {totalProfitLossPercent >= 0 ? "+" : ""}
            {totalProfitLossPercent.toFixed(2)}%
          </p>
        </div>
      </section>

      {allocationData.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
            <h3 className="text-xl font-semibold">Portfolio Allocation</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Breakdown by current market value.
            </p>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    nameKey="symbol"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell
                        key={entry.coinId}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#e5e7eb",
                    }}
                    formatter={(value, name) => [
                      formatCurrency(value),
                      `${name} Value`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg">
            <h3 className="text-xl font-semibold">Allocation Details</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Percentage of total portfolio value.
            </p>

            <div className="mt-6 space-y-4">
              {allocationData.map((holding, index) => (
                <div key={holding.coinId}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                      />

                      <div>
                        <p className="font-medium">{holding.name}</p>
                        <p className="text-sm uppercase text-slate-600 dark:text-slate-400">
                          {holding.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {holding.percentage.toFixed(2)}%
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatCurrency(holding.value)}
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${holding.percentage}%`,
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Plus size={22} />
            </div>

            <div>
              <h3 className="text-xl font-semibold">Add Holding</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add a simulated crypto purchase.
              </p>
            </div>
          </div>

          {(errorMessage || portfolioError) && (
            <div className="mt-5 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">
              <AlertCircle size={18} />
              <p>{errorMessage || portfolioError}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Coin</span>

              <select
                value={selectedCoinId}
                onChange={(event) => setSelectedCoinId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              >
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol})
                  </option>
                ))}
              </select>
            </label>

            {selectedCoin && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-3">
                {selectedCoin.image && (
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}

                <div>
                  <p className="font-medium">{selectedCoin.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Current price: {formatCurrency(selectedCoin.price)}
                  </p>
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantity
              </span>

              <input
                type="number"
                step="any"
                min="0"
                placeholder="Example: 0.25"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Purchase Price
              </span>

              <input
                type="number"
                step="any"
                min="0"
                placeholder="Example: 40000"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Purchase Date
              </span>

              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

                <button
                  type="button"
                  onClick={() => setPurchaseDate(getTodayDate())}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:bg-slate-800"
                >
                  Today
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Optional — choose a date or use today.
              </p>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500"
            >
              <Wallet size={18} />
              Add to Portfolio
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-lg">
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <h3 className="text-xl font-semibold">Holdings</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {portfolio.length} holding{portfolio.length === 1 ? "" : "s"}{" "}
              saved
            </p>
          </div>

          {portfolio.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Wallet size={28} />
              </div>

              <h4 className="mt-4 text-2xl font-bold">No holdings yet</h4>

              <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
                Add a simulated purchase to see your portfolio value and
                profit/loss calculations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-275 text-left">
                <thead className="bg-slate-100 text-sm uppercase text-slate-600 dark:text-slate-400 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4">Coin</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Buy Price</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    <th className="px-6 py-4">Current Price</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">P/L</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {portfolioWithCurrentPrices.map((holding) => (
                    <tr
                      key={holding.id}
                      className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:bg-slate-800/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {holding.image && (
                            <img
                              src={holding.image}
                              alt={holding.name}
                              className="h-8 w-8 rounded-full"
                            />
                          )}

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {holding.name}
                            </p>
                            <p className="text-sm uppercase text-slate-600 dark:text-slate-400">
                              {holding.symbol}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {editingHoldingId === holding.id ? (
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={editQuantity}
                            onChange={(event) =>
                              setEditQuantity(event.target.value)
                            }
                            className="w-28 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                          />
                        ) : (
                          holding.quantity
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingHoldingId === holding.id ? (
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={editPurchasePrice}
                            onChange={(event) =>
                              setEditPurchasePrice(event.target.value)
                            }
                            className="w-32 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                          />
                        ) : (
                          formatCurrency(holding.purchasePrice)
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingHoldingId === holding.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={editPurchaseDate}
                              onChange={(event) =>
                                setEditPurchaseDate(event.target.value)
                              }
                              className="rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setEditPurchaseDate(getTodayDate())
                              }
                              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:bg-slate-800"
                            >
                              Today
                            </button>
                          </div>
                        ) : (
                          holding.purchaseDate || "N/A"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {formatCurrency(holding.currentPrice)}
                      </td>

                      <td className="px-6 py-4">
                        {formatCurrency(holding.totalCost)}
                      </td>

                      <td className="px-6 py-4">
                        {formatCurrency(holding.currentValue)}
                      </td>

                      <td
                        className={
                          holding.profitLoss >= 0
                            ? "px-6 py-4 font-medium text-green-400"
                            : "px-6 py-4 font-medium text-red-400"
                        }
                      >
                        <p>{formatCurrency(holding.profitLoss)}</p>
                        <p className="text-sm">
                          {holding.profitLossPercent >= 0 ? "+" : ""}
                          {holding.profitLossPercent.toFixed(2)}%
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {editingHoldingId === holding.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditedHolding(holding.id)}
                              className="rounded-full bg-green-500/10 p-2 text-green-400 transition hover:bg-green-500/20"
                              aria-label={`Save ${holding.name} holding edits`}
                            >
                              <Save size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditingHolding}
                              className="rounded-full bg-slate-300 dark:bg-slate-700 p-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-400 dark:hover:bg-slate-600"
                              aria-label="Cancel editing"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingHolding(holding)}
                              className="rounded-full bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500/20"
                              aria-label={`Edit ${holding.name} holding`}
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeHolding(holding.id)}
                              className="rounded-full bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                              aria-label={`Remove ${holding.name} holding`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default Portfolio;
