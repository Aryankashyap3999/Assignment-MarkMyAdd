import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import { permissionService } from "@/services/permission.service";
import { CreatePermissionDto } from "@/dto/permission.dto";
import { handleApiError } from "@/utils/error.utils";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
} from "@/utils/response.utils";

const ensureAuth = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader || "");

  if (!token) {
    return { valid: false, response: unauthorizedResponse() };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { valid: false, response: unauthorizedResponse() };
  }

  return { valid: true, payload };
};

export async function POST(req: NextRequest) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const body = await req.json();
    const result = CreatePermissionDto.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const permission = await permissionService.create(result.data);
    return createdResponse(permission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");

    const result = await permissionService.findAll(skip, take);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
