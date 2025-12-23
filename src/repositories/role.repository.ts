import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const roleRepository = {
  create: async (data: Prisma.RoleCreateInput) => {
    return prisma.role.create({
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },

  findById: async (id: string) => {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  findByName: async (name: string) => {
    return prisma.role.findUnique({
      where: { name },
    });
  },

  findAll: async (skip = 0, take = 10) => {
    return prisma.role.findMany({
      skip,
      take,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },

  update: async (id: string, data: Prisma.RoleUpdateInput) => {
    return prisma.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.role.delete({
      where: { id },
    });
  },

  count: async () => {
    return prisma.role.count();
  },

  addPermission: async (roleId: string, permissionId: string) => {
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        role: true,
        permission: true,
      },
    });
  },

  removePermission: async (roleId: string, permissionId: string) => {
    return prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  },
};
