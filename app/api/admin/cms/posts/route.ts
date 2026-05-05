import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

// Utility to generate slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { categories: true, tags: true },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[CMS_POSTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      title, 
      content, 
      excerpt, 
      coverImage, 
      status, 
      visibility, 
      publishDate, 
      categories, 
      tags,
      authorName
    } = body;

    const slug = generateSlug(title);

    // Ensure slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt,
        coverImage,
        status: status || "Draft",
        visibility: visibility || "Public",
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        authorId: user.userId,
        authorName: authorName || "Admin",
        categories: {
          connectOrCreate: categories?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
        tags: {
          connectOrCreate: tags?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { categories: true, tags: true },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[CMS_POSTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
