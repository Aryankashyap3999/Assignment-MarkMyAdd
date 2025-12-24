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
    console.log("=== Calling Gemini API ===");
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Parse this command into JSON. Command: "${command}"

Return ONLY valid JSON (no other text) in exactly this format:
{"action":"create_role"|"create_permission"|"attach_permission"|"unknown","params":{"role_name":"name or null","permission_name":"name or null"}}

Examples:
- "Create admin role" → {"action":"create_role","params":{"role_name":"admin","permission_name":null}}
- "Create edit permission" → {"action":"create_permission","params":{"role_name":null,"permission_name":"edit"}}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: `Gemini API Error: ${response.status}` },
        { status: 400 }
      );
    }

    const result = await response.json();
    console.log("=== Gemini Full Response ===");
    console.log(JSON.stringify(result, null, 2));
    
    // Check if response contains error
    if (result.error) {
      console.error("Gemini returned error:", result.error);
      return NextResponse.json(
        { error: `Gemini Error: ${JSON.stringify(result.error)}` },
        { status: 400 }
      );
    }
    
    // Extract content from candidates (not contents)
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Extracted content:", content);
    
    if (!content) {
      console.error("No content in Gemini response");
      return NextResponse.json(
        { error: "No response from Gemini API" },
        { status: 400 }
      );
    }
    
    // Extract JSON from the response - more robust parsing
    let parsedCommand: Record<string, unknown> = { action: "unknown", params: {} };
    
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log("Cleaned content:", cleanContent);
      
      // Try to find and parse JSON in the response
      // First, try direct JSON.parse
      try {
        parsedCommand = JSON.parse(cleanContent);
        console.log("Successfully parsed JSON directly");
      } catch {
        // If that fails, try to find JSON object pattern
        const jsonMatch = cleanContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          console.log("Found JSON match:", jsonMatch[0]);
          parsedCommand = JSON.parse(jsonMatch[0]);
        } else {
          // Last resort: try to extract fields manually
          console.log("Could not find JSON pattern, trying manual extraction");
          const actionMatch = cleanContent.match(/"action"\s*:\s*"([^"]+)"/);
          const roleNameMatch = cleanContent.match(/"role_name"\s*:\s*"([^"]+)"/);
          const permNameMatch = cleanContent.match(/"permission_name"\s*:\s*"([^"]+)"/);
          
          if (actionMatch) {
            parsedCommand = {
              action: actionMatch[1],
              params: {
                role_name: roleNameMatch ? roleNameMatch[1] : null,
                permission_name: permNameMatch ? permNameMatch[1] : null,
              },
            };
          } else {
            parsedCommand = { action: "unknown", params: {} };
          }
        }
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);
      parsedCommand = { action: "unknown", params: {} };
    }

    console.log("Final Parsed Command:", parsedCommand);

    // Execute the parsed command
    let commandResult: CommandResultData = { message: "Command executed" };

    if (parsedCommand.action === "create_role") {
      const roleName = (parsedCommand.params as Record<string, unknown>)?.role_name;
      if (!roleName) {
        return NextResponse.json(
          {
            error: "Role name is required",
            parsed: parsedCommand,
          },
          { status: 400 }
        );
      }
      commandResult = await roleService.create({
        name: String(roleName),
      });
    } else if (parsedCommand.action === "create_permission") {
      const permName = (parsedCommand.params as Record<string, unknown>)?.permission_name;
      if (!permName) {
        return NextResponse.json(
          {
            error: "Permission name is required",
            parsed: parsedCommand,
          },
          { status: 400 }
        );
      }
      commandResult = await permissionService.create({
        name: String(permName),
        description: "",
      });
    } else if (parsedCommand.action === "attach_permission") {
      const roleName = (parsedCommand.params as Record<string, unknown>)?.role_name;
      const permName = (parsedCommand.params as Record<string, unknown>)?.permission_name;

      if (!roleName || !permName) {
        return NextResponse.json(
          {
            error: "Role name and permission name are required",
            parsed: parsedCommand,
          },
          { status: 400 }
        );
      }

      // Find role and permission by name
      const roles = await roleService.findAll(0, 100);
      const permissions = await permissionService.findAll(0, 100);

      const role = roles.data.find((r: Record<string, unknown>) =>
        (r.name as string)
          .toLowerCase()
          .includes(String(roleName).toLowerCase())
      );
      const permission = permissions.data.find((p: Record<string, unknown>) =>
        (p.name as string)
          .toLowerCase()
          .includes(String(permName).toLowerCase())
      );

      if (role && permission) {
        commandResult = await roleService.addPermission((role as Record<string, unknown>).id as string, (permission as Record<string, unknown>).id as string);
      } else {
        return NextResponse.json(
          {
            error: `Role or permission not found. Found roles: ${roles.data.map((r: Record<string, unknown>) => r.name).join(", ") || "none"}. Found permissions: ${permissions.data.map((p: Record<string, unknown>) => p.name).join(", ") || "none"}`,
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
