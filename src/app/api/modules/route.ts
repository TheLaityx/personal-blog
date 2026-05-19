import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        collections: { orderBy: { sortOrder: "asc" } },
        articles: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          include: { medias: true },
        },
      },
    });
    return NextResponse.json(modules);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const moduleItem = await prisma.module.create({ data });
    return NextResponse.json(moduleItem);
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
