import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const collectionId = searchParams.get("collectionId");
    const where: Record<string, unknown> = { isPublished: true };
    if (moduleId) where.moduleId = Number(moduleId);
    if (collectionId) where.collectionId = Number(collectionId);
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { medias: true, comments: true, module: true, collection: true },
    });
    return NextResponse.json(articles);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        coverImage: data.coverImage,
        moduleId: data.moduleId,
        collectionId: data.collectionId || null,
        isPublished: data.isPublished ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { medias: true },
    });
    if (data.medias?.length) {
      await prisma.media.createMany({
        data: data.medias.map((m: { url: string; type: string; filename: string }) => ({
          ...m,
          articleId: article.id,
        })),
      });
    }
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
