import express from "express";
import {
  getCoinById,
  getCoinHistory,
  getCoins,
} from "../controllers/coinController.js";

const router = express.Router();

router.get("/", getCoins);
router.get("/:id/history", getCoinHistory);
router.get("/:id", getCoinById);

export default router;