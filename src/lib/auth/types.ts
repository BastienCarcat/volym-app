import { User as DbUser } from "@/generated/prisma";
import { User as AuthUser } from "@supabase/supabase-js";

export interface CompleteUser {
  authUser: AuthUser;
  dbUser: DbUser;
}
