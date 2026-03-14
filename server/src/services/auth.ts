import { AppError } from "../middleware/error";
import { db } from "../db";
import { users } from "../db/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {
  async register(payload: RegisterPayload): Promise<void> {
    try {
      const { firstName, lastName, email, password } = payload;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        throw new AppError("Email already in use", 409);
      }

      const hashedPassword = await this.hashPassword(password);

      await db.insert(users).values({
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Could not register User", 500);
    }
  }

  async login(payload: LoginPayload): Promise<string> {
    try {
      const { email, password } = payload;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!existing) {
        throw new AppError("Invalid credentials", 400);
      }

      const correctPass = await this.comparePassword(
        password,
        existing.passwordHash,
      );

      if (!correctPass) throw new AppError("Invalid credentials", 400);

      return this.signToken(existing.id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Could not login User", 500);
    }
  }

  // Hash a plain text password
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private signToken(userId: number): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
  }
}
