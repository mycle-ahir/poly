import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  try {
    const where: any = {
      status: "Published",
    };

    if (category && category !== "All Posts") {
      where.categories = {
        some: { name: category }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishDate: "desc" },
      include: { categories: true, tags: true },
    });

    const categories = await prisma.category.findMany({
      select: { name: true }
    });

    return NextResponse.json({ 
      posts, 
      categories: ["All Posts", ...categories.map(c => c.name)]
    });
  } catch (error) {
    console.error("[BLOG_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
