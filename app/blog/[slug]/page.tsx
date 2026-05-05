"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Tag as TagIcon, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export default function BlogPostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blog/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
      } else {
        toast.error("Article not found");
        router.push("/blog");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981]" size={40} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white pb-24">
      {/* Breadcrumbs */}
      <div className="bg-[#0B0F17] border-b border-[#1f2937] py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-[#a1a1aa]">
          <Link href="/blog" className="hover:text-[#10b981] transition-colors">Blog</Link>
          <ChevronRight size={12} />
          {post.categories.map((c: any) => (
            <span key={c.id} className="hover:text-[#10b981] transition-colors">{c.name}</span>
          ))}
          <ChevronRight size={12} />
          <span className="text-[#10b981] truncate">{post.title}</span>
        </div>
      </div>

      {/* Article Header */}
      <div className="pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Articles
          </Link>

          <div className="flex gap-2 mb-6">
            {post.categories.map((c: any) => (
              <span key={c.id} className="bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#10b981]/20">
                {c.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-[#1f2937]">
            <div className="flex items-center gap-6 text-[#a1a1aa] text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-[#10b981] font-bold">
                  {post.authorName.charAt(0)}
                </div>
                <span className="text-white font-medium">{post.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} /> {new Date(post.publishDate).toLocaleDateString()}
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-[#1f2937] text-sm text-[#a1a1aa] hover:text-white hover:border-[#10b981] transition-all"
            >
              <Share2 size={16} /> Share Article
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-6">
        <article className="max-w-3xl mx-auto prose prose-invert prose-green prose-lg">
          {/* Cover image placeholder if no real image */}
          <div className="aspect-video w-full bg-[#111827] rounded-2xl mb-12 flex items-center justify-center relative overflow-hidden border border-[#1f2937]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
            <div className="text-[#10b981]/20 text-9xl font-bold italic select-none">FF</div>
          </div>

          <div 
            className="blog-content leading-relaxed text-[#d1d5db]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t border-[#1f2937]">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t: any) => (
                <span key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-xs text-[#a1a1aa] hover:border-[#10b981] transition-colors cursor-pointer">
                  <TagIcon size={12} /> #{t.name}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Footer Navigation */}
      <div className="mt-24 px-6">
        <div className="max-w-4xl mx-auto bg-[#111827] border border-[#1f2937] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your Trading Journey Today</h2>
          <p className="text-[#a1a1aa] mb-8 max-w-lg mx-auto">
            Put your knowledge into practice with a FundedFlips trading account and access up to $200,000 in capital.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/user/purchase" 
              className="px-8 py-3 bg-[#10b981] hover:bg-[#059669] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Get Funded
            </Link>
            <Link 
              href="/blog" 
              className="px-8 py-3 bg-transparent border border-[#1f2937] hover:border-[#10b981] text-white font-bold rounded-xl transition-all"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: white; }
        .blog-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: white; }
        .blog-content ul, .blog-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content blockquote { border-left: 4px solid #10b981; padding-left: 1.5rem; font-style: italic; color: #10b981; margin: 2rem 0; }
      `}</style>
    </div>
  );
}
