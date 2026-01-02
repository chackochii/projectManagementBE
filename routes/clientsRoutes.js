import express from "express";
import { addClient, getClients } from "../modules/clients/clients.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",  getClients);
router.post("/", authMiddleware, addClient);

export default router;
