import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany();
    const result: Record<string, string> = {};
    configs.forEach((c) => (result[c.key] = c.value));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { key, value } = await req.json();
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
