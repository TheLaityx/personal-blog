import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const moduleItem = await prisma.module.findUnique({
      where: { id: Number(id) },
      include: {
        collections: {
          orderBy: { sortOrder: "asc" },
          include: {
            articles: {
              where: { isPublished: true },
              orderBy: { sortOrder: "asc" },
              include: { medias: true },
            },
          },
        },
        articles: {
          where: { isPublished: true, collectionId: null },
          orderBy: { sortOrder: "asc" },
          include: { medias: true, comments: true },
        },
      },
    });
    if (!moduleItem) {
      return NextResponse.json({ error: "模块不存在" }, { status: 404 });
    }
    return NextResponse.json(moduleItem);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const moduleItem = await prisma.module.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(moduleItem);
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.module.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
