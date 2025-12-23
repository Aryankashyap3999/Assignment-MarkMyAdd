import { userRepository } from "@/repositories/user.repository";
import {
  hashPassword,
  comparePasswords,
  generateToken,
} from "@/utils/auth.utils";
import { ApiError } from "@/utils/error.utils";
import { SignupDtoType, LoginDtoType } from "@/dto/auth.dto";

export const authService = {
  signup: async (data: SignupDtoType) => {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles: [],
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },

  login: async (data: LoginDtoType) => {
    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Compare password
    const isPasswordValid = await comparePasswords(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Extract roles
    const roles = user.roles.map((ur) => ur.role.name);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
    };
  },
};
