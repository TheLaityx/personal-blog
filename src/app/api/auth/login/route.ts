import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP: 5 attempts per 15 minutes
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "尝试次数过多，请稍后再试" }, { status: 429 });
    }

    const { username, password } = await req.json();
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    const token = signToken({ userId: user.id, username: user.username });
    return NextResponse.json({ token, user: { username: user.username, nickname: user.nickname } });
  } catch (e) {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
