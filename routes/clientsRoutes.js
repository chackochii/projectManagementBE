import express from "express";
import { addClient, getClients, getClientBillingController, editClient, deleteClient } from "../modules/clients/clients.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.post("/", authMiddleware, addClient);
router.get("/:clientId/billing", authMiddleware, getClientBillingController);
router.put("/:clientId", authMiddleware, editClient);
router.delete("/:clientId", authMiddleware, deleteClient);

export default router;
