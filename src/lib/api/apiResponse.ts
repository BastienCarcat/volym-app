import { NextResponse } from "next/server";

export const api = {
  success: <T>(data: T, status = 200) =>
    NextResponse.json({ success: true, data }, { status }),

  error: (message: string, status = 500) =>
    NextResponse.json({ success: false, error: message }, { status }),

  redirect: (url: URL, status = 302) => NextResponse.redirect(url, status),
};
