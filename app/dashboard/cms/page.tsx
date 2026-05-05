"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export default function CMSPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/admin/cms/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/admin/cms/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Post deleted");
        setPosts(posts.filter(p => p.id !== id));
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filter === "All") return true;
    return p.status === filter;
  });

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-[#3b82f6]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Posts</h1>
          <div className="flex items-center gap-4 mt-2">
            {["All", "Published", "Draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm transition-colors ${
                  filter === f ? "text-[#3b82f6] font-semibold" : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                {f} ({f === "All" ? posts.length : posts.filter(p => p.status === f).length})
              </button>
            ))}
          </div>
        </div>
        <Link 
          href="/dashboard/cms/new"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all"
        >
          <Plus size={18} /> Add New
        </Link>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0B0F17] text-[#a1a1aa] border-b border-[#1f2937]">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Categories</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#4b5563]">
                    No posts found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#1f2937]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white group-hover:text-[#3b82f6] transition-colors">{post.title}</div>
                      <div className="text-[11px] text-[#4b5563] mt-0.5 truncate max-w-[200px]">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-[#a1a1aa]">{post.authorName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.categories.map((c: any) => (
                          <span key={c.id} className="bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] px-1.5 py-0.5 rounded border border-[#3b82f6]/20">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        post.status === "Published" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#a1a1aa] text-xs">
                      {new Date(post.publishDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/cms/edit/${post.id}`}
                          className="p-1.5 rounded-lg bg-[#1f2937] hover:bg-[#3b82f6]/20 text-[#a1a1aa] hover:text-[#3b82f6] transition-all"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-lg bg-[#1f2937] hover:bg-red-500/20 text-[#a1a1aa] hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
