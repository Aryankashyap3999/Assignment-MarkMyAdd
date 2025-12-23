import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import { permissionService } from "@/services/permission.service";
import { UpdatePermissionDto } from "@/dto/permission.dto";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const { id } = await params;
    const permission = await permissionService.findById(id);
    return successResponse(permission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = ensureAuth(req);
    if (!auth.valid) return auth.response;

    const { id } = await params;
    const body = await req.json();
    const result = UpdatePermissionDto.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const permission = await permissionService.update(id, result.data);
    return successResponse(permission);
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
    await permissionService.delete(id);
    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
