import { permissionRepository } from "@/repositories/permission.repository";
import { ApiError } from "@/utils/error.utils";
import { CreatePermissionDtoType, UpdatePermissionDtoType } from "@/dto/permission.dto";

export const permissionService = {
  create: async (data: CreatePermissionDtoType) => {
    // Check if permission already exists
    const existing = await permissionRepository.findByName(data.name);
    if (existing) {
      throw new ApiError(409, "Permission with this name already exists");
    }

    return permissionRepository.create(data);
  },

  findById: async (id: string) => {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new ApiError(404, "Permission not found");
    }
    return permission;
  },

  findAll: async (skip = 0, take = 10) => {
    const permissions = await permissionRepository.findAll(skip, take);
    const total = await permissionRepository.count();
    return {
      data: permissions,
      total,
      skip,
      take,
    };
  },

  update: async (id: string, data: UpdatePermissionDtoType) => {
    // Check if permission exists
    await permissionService.findById(id);

    // Check if new name already exists (if name is being updated)
    if (data.name) {
      const existing = await permissionRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ApiError(409, "Permission with this name already exists");
      }
    }

    return permissionRepository.update(id, data);
  },

  delete: async (id: string) => {
    // Check if permission exists
    await permissionService.findById(id);

    return permissionRepository.delete(id);
  },
};
