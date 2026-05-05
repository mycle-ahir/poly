"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Tag as TagIcon, 
  Loader2,
  TrendingUp,
  BookOpen
} from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogData();
  }, [selectedCategory, searchQuery]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/blog", window.location.origin);
      if (selectedCategory !== "All Posts") url.searchParams.set("category", selectedCategory);
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
        if (categories.length === 0) setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold uppercase tracking-wider mb-6">
            <BookOpen size={12} /> FundedFlips Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Trading Insights & <span className="text-[#10b981]">Education</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto mb-12">
            Expert tips, strategies, and insights to help you succeed in prop trading
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563]" size={20} />
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-[#1f2937] rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                    : "bg-[#111827] text-[#a1a1aa] border border-[#1f2937] hover:border-[#374151] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#10b981]" size={40} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#a1a1aa] text-lg">No articles found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {!searchQuery && selectedCategory === "All Posts" && featuredPost && (
              <div className="mb-20">
                <Link 
                  href={`/blog/${featuredPost.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden hover:border-[#10b981]/50 transition-all"
                >
                  <div className="aspect-[16/10] bg-[#0B0F17] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-transparent opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                        <TrendingUp className="text-[#10b981]" size={32} />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#10b981] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Featured</span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="flex gap-2 mb-4">
                      {featuredPost.categories.map((c: any) => (
                        <span key={c.id} className="text-[#10b981] text-[10px] font-bold uppercase tracking-widest">{c.name}</span>
                      ))}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-[#10b981] transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[#a1a1aa] text-lg mb-8 line-clamp-3">
                      {featuredPost.content.substring(0, 200).replace(/<[^>]*>?/gm, '')}...
                    </p>
                    <div className="flex items-center gap-6 text-[#4b5563] text-sm mb-8">
                      <div className="flex items-center gap-2">
                        <User size={14} /> {featuredPost.authorName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(featuredPost.publishDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      Read Full Article <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* More Articles */}
            <div>
              <h3 className="text-2xl font-bold mb-8">
                {searchQuery || selectedCategory !== "All Posts" ? "Search Results" : "More Articles"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(searchQuery || selectedCategory !== "All Posts" ? posts : otherPosts).map((post) => (
                  <Link 
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden hover:border-[#10b981]/50 transition-all flex flex-col"
                  >
                    <div className="aspect-video bg-[#0B0F17] relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <BookOpen size={48} className="text-[#10b981]" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((c: any) => (
                          <span key={c.id} className="text-[#10b981] text-[10px] font-bold uppercase tracking-widest bg-[#10b981]/10 px-2 py-0.5 rounded-full">{c.name}</span>
                        ))}
                      </div>
                      <h4 className="text-xl font-bold mb-3 group-hover:text-[#10b981] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-[#a1a1aa] text-sm mb-6 line-clamp-3">
                        {post.content.substring(0, 120).replace(/<[^>]*>?/gm, '')}...
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-[#1f2937] flex flex-col gap-4">
                        <div className="flex items-center justify-between text-[#4b5563] text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <User size={12} /> {post.authorName}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} /> {new Date(post.publishDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((t: any) => (
                            <span key={t.id} className="text-[10px] text-[#4b5563] flex items-center gap-1">
                              <TagIcon size={10} /> #{t.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                          Read More <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
