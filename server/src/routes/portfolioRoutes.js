import express from "express";
import {
  addPortfolioHolding,
  clearPortfolio,
  deletePortfolioHolding,
  getPortfolio,
  updatePortfolioHolding,
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getPortfolio);
router.post("/", addPortfolioHolding);
router.delete("/", clearPortfolio);
router.put("/:holdingId", updatePortfolioHolding);
router.delete("/:holdingId", deletePortfolioHolding);

export default router;