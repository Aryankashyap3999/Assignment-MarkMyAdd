import { roleRepository } from "@/repositories/role.repository";
import { permissionRepository } from "@/repositories/permission.repository";
import { ApiError } from "@/utils/error.utils";
import { CreateRoleDtoType, UpdateRoleDtoType } from "@/dto/role.dto";

export const roleService = {
  create: async (data: CreateRoleDtoType) => {
    // Check if role already exists
    const existing = await roleRepository.findByName(data.name);
    if (existing) {
      throw new ApiError(409, "Role with this name already exists");
    }

    return roleRepository.create(data);
  },

  findById: async (id: string) => {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }
    return role;
  },

  findAll: async (skip = 0, take = 10) => {
    const roles = await roleRepository.findAll(skip, take);
    const total = await roleRepository.count();
    return {
      data: roles,
      total,
      skip,
      take,
    };
  },

  update: async (id: string, data: UpdateRoleDtoType) => {
    // Check if role exists
    await roleService.findById(id);

    // Check if new name already exists (if name is being updated)
    if (data.name) {
      const existing = await roleRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ApiError(409, "Role with this name already exists");
      }
    }

    return roleRepository.update(id, data);
  },

  delete: async (id: string) => {
    // Check if role exists
    await roleService.findById(id);

    return roleRepository.delete(id);
  },

  addPermission: async (roleId: string, permissionId: string) => {
    // Check if role exists
    const role = await roleService.findById(roleId);

    // Check if permission exists
    const permission = await permissionRepository.findById(permissionId);
    if (!permission) {
      throw new ApiError(404, "Permission not found");
    }

    // Check if permission is already attached
    const existing = role.permissions.find(
      (rp) => rp.permissionId === permissionId
    );
    if (existing) {
      throw new ApiError(409, "Permission already attached to this role");
    }

    return roleRepository.addPermission(roleId, permissionId);
  },

  removePermission: async (roleId: string, permissionId: string) => {
    // Check if role exists
    await roleService.findById(roleId);

    // Check if permission exists
    await permissionRepository.findById(permissionId);

    return roleRepository.removePermission(roleId, permissionId);
  },
};
