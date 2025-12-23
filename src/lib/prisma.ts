import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () =>
  new PrismaClient({
    log: ["query"],
  });

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma2 = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

export const prisma: PrismaClientSingleton =
  globalForPrisma2.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma2.prisma = prisma;
