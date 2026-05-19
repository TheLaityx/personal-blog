import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const collection = await prisma.collection.findUnique({
      where: { id: Number(id) },
      include: {
        module: true,
        articles: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          include: { medias: true },
        },
      },
    });
    if (!collection) {
      return NextResponse.json({ error: "合集不存在" }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const collection = await prisma.collection.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(collection);
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.collection.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
