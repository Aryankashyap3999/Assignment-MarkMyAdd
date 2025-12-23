import { NextResponse } from "next/server";

export const successResponse = <T>(data: T, statusCode: number = 200) => {
  return NextResponse.json(data, { status: statusCode });
};

export const createdResponse = <T>(data: T) => {
  return NextResponse.json(data, { status: 201 });
};

export const noContentResponse = () => {
  return new NextResponse(null, { status: 204 });
};

export const unauthorizedResponse = (message: string = "Unauthorized") => {
  return NextResponse.json({ error: message }, { status: 401 });
};

export const forbiddenResponse = (message: string = "Forbidden") => {
  return NextResponse.json({ error: message }, { status: 403 });
};

export const notFoundResponse = (message: string = "Not found") => {
  return NextResponse.json({ error: message }, { status: 404 });
};

export const conflictResponse = (message: string = "Conflict") => {
  return NextResponse.json({ error: message }, { status: 409 });
};
