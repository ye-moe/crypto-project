import express from "express";
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
} from "../controllers/watchlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWatchlist);
router.post("/", addWatchlistItem);
router.delete("/:coinId", deleteWatchlistItem);

export default router;