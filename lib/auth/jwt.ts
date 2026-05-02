import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in environment variables");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not set in environment variables");

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

/**
 * Generate a short-lived access token (15 minutes).
 * Short expiry minimizes damage from token theft.
 */
export function generateAccessToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

/**
 * Generate a long-lived refresh token (7 days).
 * Stored in DB for rotation & revocation.
 */
export function generateRefreshToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode an access token.
 * Throws if expired or invalid.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Extract bearer token from Authorization header.
 * Returns null if missing or malformed.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
