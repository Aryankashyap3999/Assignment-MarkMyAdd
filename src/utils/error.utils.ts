import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);

  // Handle Prisma errors
  if (error instanceof Error && error.message.includes("does not exist on the database server")) {
    return NextResponse.json(
      { error: "Database is not properly initialized. Please contact the administrator." },
      { status: 503 }
    );
  }

  if (error instanceof Error && error.message.includes("PrismaClientKnownRequestError")) {
    return NextResponse.json(
      { error: "Database operation failed. Please try again later." },
      { status: 500 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Don't expose sensitive error details in production
    const isDevelopment = process.env.NODE_ENV === "development";
    const message = isDevelopment ? error.message : "An error occurred while processing your request";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(
    { error: "An unknown error occurred" },
    { status: 500 }
  );
};

export const handleValidationError = (errors: Record<string, string>) => {
  return NextResponse.json(
    { errors, message: "Validation failed" },
    { status: 400 }
  );
};
