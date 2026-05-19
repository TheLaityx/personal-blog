import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString, isValidId } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("articleId");
    const articleId = rawId ? isValidId(rawId) : null;
    const where = articleId ? { articleId, isApproved: true } : { isApproved: true };
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          where: { isApproved: true },
          orderBy: { createdAt: "asc" },
        },
        article: { select: { title: true, id: true } },
      },
    });
    return NextResponse.json(comments);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP: 20 comments per 5 minutes
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const limit = rateLimit(`comment:${ip}`, 20, 5 * 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "评论过于频繁，请稍后再试" }, { status: 429 });
    }

    const body = await req.json();
    const content = sanitizeString(body.content, 1000);
    if (!content || content.length < 1) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }

    const author = sanitizeString(body.author, 50) || "匿名";
    const email = body.email ? sanitizeString(body.email, 100) : null;
    const articleId = body.articleId ? isValidId(body.articleId) : null;
    const parentId = body.parentId ? isValidId(body.parentId) : null;

    const comment = await prisma.comment.create({
      data: {
        content,
        author,
        email,
        articleId,
        parentId,
      },
    });
    return NextResponse.json(comment);
  } catch (e) {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
