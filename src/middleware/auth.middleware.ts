import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import { JWTPayload } from "@/types/auth";

export const withAuth = (handler: Function) => {
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

      // Attach user to request
      const clonedReq = req.clone();
      (clonedReq as any).user = payload;

      return handler(clonedReq, payload);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
};
