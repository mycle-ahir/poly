import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, extractBearerToken, TokenPayload } from "./jwt";

/**
 * Authenticate a request and return the decoded user payload.
 * Returns null if auth fails — caller decides the error response.
 */
export function authenticateRequest(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get("authorization");
  const token = extractBearerToken(authHeader);
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Higher-order wrapper for protected API routes.
 * Injects `user` into the handler context.
 */
export function withAuth(
  handler: (req: NextRequest, context: { user: TokenPayload; params?: any }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params?: any }) => {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing or invalid access token" },
        { status: 401 }
      );
    }
    return handler(req, { user, params: context?.params });
  };
}

/**
 * Higher-order wrapper for admin-only API routes.
 * Checks both authentication AND role === ADMIN.
 */
export function withAdmin(
  handler: (req: NextRequest, context: { user: TokenPayload; params?: any }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params?: any }) => {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing or invalid access token" },
        { status: 401 }
      );
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }
    return handler(req, { user, params: context?.params });
  };
}
