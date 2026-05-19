import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const where = moduleId ? { moduleId: Number(moduleId) } : {};
    const collections = await prisma.collection.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: { articles: true },
    });
    return NextResponse.json(collections);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const collection = await prisma.collection.create({ data });
    return NextResponse.json(collection);
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
