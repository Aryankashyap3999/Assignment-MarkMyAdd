import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const permissionRepository = {
  create: async (data: Prisma.PermissionCreateInput) => {
    return prisma.permission.create({ data });
  },

  findById: async (id: string) => {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  findByName: async (name: string) => {
    return prisma.permission.findUnique({
      where: { name },
    });
  },

  findAll: async (skip = 0, take = 10) => {
    return prisma.permission.findMany({
      skip,
      take,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  update: async (id: string, data: Prisma.PermissionUpdateInput) => {
    return prisma.permission.update({
      where: { id },
      data,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.permission.delete({
      where: { id },
    });
  },

  count: async () => {
    return prisma.permission.count();
  },
};
