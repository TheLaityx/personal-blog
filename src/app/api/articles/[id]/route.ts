import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        medias: true,
        module: true,
        collection: true,
        comments: {
          where: { parentId: null, isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: { isApproved: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
    if (!article) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        content: data.content,
        coverImage: data.coverImage,
        moduleId: data.moduleId,
        collectionId: data.collectionId,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
      },
    });
    // 更新媒体：先删除旧的，再创建新的
    if (Array.isArray(data.medias)) {
      await prisma.media.deleteMany({ where: { articleId: Number(id) } });
      if (data.medias.length) {
        await prisma.media.createMany({
          data: data.medias.map((m: { url: string; type: string; filename: string; sortOrder?: number }) => ({
            url: String(m.url || ""),
            type: String(m.type || "file"),
            filename: String(m.filename || ""),
            sortOrder: Number(m.sortOrder) || 0,
            articleId: Number(id),
          })),
        });
      }
    }
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.article.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
