import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  throw new Error("Supabase middleware is deprecated. Use Better Auth middleware instead.");
}
