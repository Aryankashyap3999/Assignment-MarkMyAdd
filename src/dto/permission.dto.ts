import { z } from "zod";

export const CreatePermissionDto = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().optional(),
});

export const UpdatePermissionDto = z.object({
  name: z.string().min(1, "Permission name is required").optional(),
  description: z.string().optional(),
});

export type CreatePermissionDtoType = z.infer<typeof CreatePermissionDto>;
export type UpdatePermissionDtoType = z.infer<typeof UpdatePermissionDto>;
