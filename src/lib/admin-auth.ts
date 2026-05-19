import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function checkAdmin(req: NextRequest): { ok: boolean; response?: NextResponse } {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || "";

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "未登录" }, { status: 401 }) };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: "登录已过期" }, { status: 401 }) };
  }

  return { ok: true };
}
