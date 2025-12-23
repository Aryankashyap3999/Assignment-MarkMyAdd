import { z } from "zod";

export const CreateRoleDto = z.object({
  name: z.string().min(1, "Role name is required"),
});

export const UpdateRoleDto = z.object({
  name: z.string().min(1, "Role name is required").optional(),
});

export type CreateRoleDtoType = z.infer<typeof CreateRoleDto>;
export type UpdateRoleDtoType = z.infer<typeof UpdateRoleDto>;
