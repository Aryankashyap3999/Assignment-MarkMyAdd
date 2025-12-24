import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaMariaDb | undefined;
};

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create adapter (reuse existing one if available)
  const adapter = globalForPrisma.adapter ?? new PrismaMariaDb(process.env.DATABASE_URL);

  // Store adapter globally in development to prevent multiple instances
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.adapter = adapter;
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "info"] : ["error"],
  });
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}