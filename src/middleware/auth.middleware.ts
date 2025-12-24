import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import type { JWTPayload } from "@/types/auth";

type AuthenticatedHandler = (req: NextRequest, user: JWTPayload) => Promise<NextResponse>;

export const withAuth = (handler: AuthenticatedHandler) => {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("Authorization");
      const token = extractTokenFromHeader(authHeader || "");

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized - No token provided" },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        );
      }

      // Call handler with authenticated request
      return handler(req, payload);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
};;
