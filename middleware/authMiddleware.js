import jwt from "jsonwebtoken";
import { db } from "../config/database.js";   // contains all models

const getUserModel = () => db.User;  

export const authMiddleware = async (req, res, next) => {
  try {
    const User = getUserModel();
    const authHeader = req.headers.authorization;
    // console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    // <-- UPDATED LINE HERE -->
    const user = await User.findOne({ where: { id: decoded.id } });

    // console.log(user, "user found in authMiddleware");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
