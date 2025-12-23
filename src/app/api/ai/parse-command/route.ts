import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.utils";
import { handleApiError } from "@/utils/error.utils";
import { unauthorizedResponse } from "@/utils/response.utils";
import { roleService } from "@/services/role.service";
import { permissionService } from "@/services/permission.service";

interface AuthResponse {
  valid: boolean;
  response?: NextResponse;
  payload?: Record<string, unknown>;
}


interface CommandResultData {
  message?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

const ensureAuth = (req: NextRequest): AuthResponse => {
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

    const { command } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "command is required" },
        { status: 400 }
      );
    }

    // Call Gemini API to parse the command
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an RBAC configuration assistant. Parse the following command and return a JSON object with the action and parameters.

Command: "${command}"

Respond with valid JSON in this format (no other text):
{
  "action": "create_role" | "create_permission" | "attach_permission" | "detach_permission" | "unknown",
  "params": {
    "role_name": "string or null",
    "permission_name": "string or null"
  }
}

Examples:
- "Create a new role called admin" -> {"action": "create_role", "params": {"role_name": "admin", "permission_name": null}}
- "Give the editor role the delete articles permission" -> {"action": "attach_permission", "params": {"role_name": "editor", "permission_name": "delete articles"}}`,
              },
            ],
          },
        ],
      }),
    });

    const result = await response.json();
    const content = result.contents?.[0]?.parts?.[0]?.text || "{}";
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsedCommand = jsonMatch ? JSON.parse(jsonMatch[0]) : { action: "unknown" };

    // Execute the parsed command
    let commandResult: CommandResultData = { message: "Command executed" };

    if (parsedCommand.action === "create_role") {
      commandResult = await roleService.create({
        name: parsedCommand.params.role_name,
      });
    } else if (parsedCommand.action === "create_permission") {
      commandResult = await permissionService.create({
        name: parsedCommand.params.permission_name,
      });
    } else if (parsedCommand.action === "attach_permission") {
      // Find role and permission by name
      const roles = await roleService.findAll(0, 100);
      const permissions = await permissionService.findAll(0, 100);

      const role = roles.data.find((r: Record<string, unknown>) =>
        (r.name as string)
          .toLowerCase()
          .includes(parsedCommand.params.role_name?.toLowerCase())
      );
      const permission = permissions.data.find((p: Record<string, unknown>) =>
        (p.name as string)
          .toLowerCase()
          .includes(parsedCommand.params.permission_name?.toLowerCase())
      );

      if (role && permission) {
        commandResult = await roleService.addPermission(role.id, permission.id);
      } else {
        return NextResponse.json(
          {
            error: "Role or permission not found",
            parsed: parsedCommand,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      parsed: parsedCommand,
      result: commandResult,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
