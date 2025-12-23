import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import { roleService } from "@/services/role.service";
import { handleApiError } from "@/utils/error.utils";
import {
  successResponse,
  unauthorizedResponse,
  noContentResponse,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const { id } = await params;
    const { permissionId } = await req.json();

    if (!permissionId) {
      return NextResponse.json(
        { error: "permissionId is required" },
        { status: 400 }
      );
    }

    const result = await roleService.addPermission(id, permissionId);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const { id } = await params;
    const { permissionId } = await req.json();

    if (!permissionId) {
      return NextResponse.json(
        { error: "permissionId is required" },
        { status: 400 }
      );
    }

    await roleService.removePermission(id, permissionId);
    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
