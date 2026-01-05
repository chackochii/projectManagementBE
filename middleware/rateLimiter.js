import rateLimit from "express-rate-limit";

/* --------------------------------------------------
   GLOBAL API RATE LIMITER
   Applies to ALL /api routes
-------------------------------------------------- */
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,               // 120 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down.",
  },
});

/* --------------------------------------------------
   STRICT LIMITER (AUTH / SENSITIVE ACTIONS)
-------------------------------------------------- */
export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,                // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Try again later.",
  },
});
