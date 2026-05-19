import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
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
