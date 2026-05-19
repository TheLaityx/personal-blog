import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/validate";

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
    const body = await req.json();
    const name = sanitizeString(body.name, 100);
    if (!name) {
      return NextResponse.json({ error: "模块名称不能为空" }, { status: 400 });
    }

    const moduleItem = await prisma.module.create({
      data: {
        name,
        description: sanitizeString(body.description, 500) || null,
        wallpaper: sanitizeString(body.wallpaper, 500) || null,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });
    return NextResponse.json(moduleItem);
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
