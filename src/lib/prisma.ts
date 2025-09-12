import * as Prisma from "@prisma/client";

// Narrow in a way that avoids named import type resolution issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { PrismaClient } = Prisma as unknown as { PrismaClient: new (...args: any[]) => any };

const globalForPrisma = global as unknown as { prisma?: unknown };

export const prisma =
  (globalForPrisma.prisma as unknown) ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


