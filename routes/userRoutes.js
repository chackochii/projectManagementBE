import express from "express";
import {loginUser, createUser , getUsers, loginAdmin, updateUserStatus} from "../modules/user/user.controller.js";
import {requireAdmin} from "../middleware/roleMiddleware.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

export const userRoutes = () => {
  const router = express.Router();

  router.post("/login",loginUser);
  // router.post("/register",authMiddleware, requireAdmin(), createUser);
  router.post("/register",authMiddleware,requireAdmin(), createUser);
  router.get("/", authMiddleware, getUsers);
  router.post("/admin/login", loginAdmin);

  router.post("/status", authMiddleware, requireAdmin(), updateUserStatus);


  return router;
};
