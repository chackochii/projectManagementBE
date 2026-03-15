import express from "express";
import {loginUser, createUser , getUsers, loginAdmin, updateUserStatus,updateUser, deleteUser} from "../modules/user/user.controller.js";
import {requireAdmin} from "../middleware/roleMiddleware.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

export const userRoutes = () => {
  const router = express.Router();

  /**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         name:
 *           type: string
 *           example: Edwin Chacko
 *         email:
 *           type: string
 *           example: edwin@example.com
 *         role:
 *           type: string
 *           example: developer
 *         status:
 *           type: string
 *           example: active
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 */



  /**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     description: Login endpoint for internal users such as admin, developer, project manager etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid email or password
 */

  router.post("/login",loginUser);


  // router.post("/register",authMiddleware, requireAdmin(), createUser);
  router.post("/register", createUser);
  router.get("/", authMiddleware, getUsers);
  router.post("/admin/login", loginAdmin);
   
  router.put("/:id", authMiddleware, requireAdmin(), updateUser);
  router.delete("/:id", authMiddleware, requireAdmin(), deleteUser);


  router.post("/status", authMiddleware, requireAdmin(), updateUserStatus);


  return router;
};
