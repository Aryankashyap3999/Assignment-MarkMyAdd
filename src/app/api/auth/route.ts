import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { SignupDto, LoginDto } from "@/dto/auth.dto";
import { handleApiError } from "@/utils/error.utils";

export async function POST(req: NextRequest) {
  try {
    const { action, username, email, password } = await req.json();

    if (action === "signup") {
      const result = SignupDto.safeParse({ username, email, password });
      if (!result.success) {
        return NextResponse.json(
          { error: "Validation failed", details: result.error.errors },
          { status: 400 }
        );
      }

      const response = await authService.signup(result.data);
      return NextResponse.json(response, { status: 201 });
    }

    if (action === "login") {
      const result = LoginDto.safeParse({ email, password });
      if (!result.success) {
        return NextResponse.json(
          { error: "Validation failed", details: result.error.errors },
          { status: 400 }
        );
      }

      const response = await authService.login(result.data);
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
