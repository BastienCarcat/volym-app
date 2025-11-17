import { User as DbUser } from "@/generated/prisma";
import { User as AuthUser } from "@/lib/better-auth/auth";

export interface CompleteUser {
  authUser: AuthUser;
  dbUser: DbUser;
}
