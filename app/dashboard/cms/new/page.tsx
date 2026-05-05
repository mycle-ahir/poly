"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bold, Italic, Underline, AlignLeft, 
  AlignCenter, AlignRight, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Code, Quote,
  Plus, X, Loader2, Save, Calendar, User, Eye, Tag as TagIcon, FolderOpen
} from "lucide-react";
import { toast } from "sonner";

export default function NewPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Post State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [visibility, setVisibility] = useState("Public");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [authorName, setAuthorName] = useState("Admin");
  
  // Categorization
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddCategory = () => {
    if (categoryInput && !categories.includes(categoryInput)) {
      setCategories([...categories, categoryInput]);
      setCategoryInput("");
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!title) return toast.error("Title is required");
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/admin/cms/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          status,
          visibility,
          publishDate,
          authorName,
          categories,
          tags
        }),
      });

      if (res.ok) {
        toast.success("Post created successfully");
        router.push("/dashboard/cms");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Create New Post</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard/cms")}
            className="px-4 py-2 text-sm text-[#a1a1aa] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Publish
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Main Editor */}
        <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl">
          {/* Editor Toolbar */}
          <div className="bg-[#0B0F17] border-b border-[#1f2937] p-2 flex flex-wrap items-center gap-1">
            {[
              { icon: Bold, label: "Bold" },
              { icon: Italic, label: "Italic" },
              { icon: Underline, label: "Underline" },
              { divider: true },
              { icon: AlignLeft, label: "Align Left" },
              { icon: AlignCenter, label: "Align Center" },
              { icon: AlignRight, label: "Align Right" },
              { divider: true },
              { icon: List, label: "Bullet List" },
              { icon: ListOrdered, label: "Ordered List" },
              { divider: true },
              { icon: LinkIcon, label: "Insert Link" },
              { icon: ImageIcon, label: "Insert Image" },
              { icon: Code, label: "Code Block" },
              { icon: Quote, label: "Blockquote" },
            ].map((tool: any, idx: number) => {
              if (tool.divider) {
                return <div key={idx} className="w-px h-6 bg-[#1f2937] mx-1" />;
              }
              const Icon = tool.icon;
              return (
                <button 
                  key={idx}
                  className="p-2 rounded-lg hover:bg-[#1f2937] text-[#a1a1aa] hover:text-white transition-all"
                  title={tool.label}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="p-8 space-y-4 min-h-[600px]">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title..."
              className="w-full bg-transparent text-4xl font-bold text-white outline-none placeholder-[#1f2937] border-none"
            />
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your content..."
              className="w-full bg-transparent text-lg text-[#d1d5db] outline-none placeholder-[#1f2937] border-none min-h-[500px] resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-[320px] space-y-6">
          {/* Status & Visibility */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white mb-2">Publishing Settings</h3>
            
            <div>
              <label className="text-[11px] text-[#a1a1aa] uppercase tracking-wider font-bold block mb-1.5">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors"
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Scheduled</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#a1a1aa] uppercase tracking-wider font-bold block mb-1.5">Visibility</label>
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors"
              >
                <option>Public</option>
                <option>Private</option>
                <option>Password Protected</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#a1a1aa] uppercase tracking-wider font-bold block mb-1.5 flex items-center gap-2">
                <Calendar size={12} /> Publish Date
              </label>
              <input 
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#a1a1aa] uppercase tracking-wider font-bold block mb-1.5 flex items-center gap-2">
                <User size={12} /> Author
              </label>
              <input 
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FolderOpen size={16} className="text-[#3b82f6]" /> Categories
            </h3>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Add category..."
                className="flex-1 bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button 
                onClick={handleAddCategory}
                className="p-1.5 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-[#1f2937] text-white text-[10px] px-2 py-1 rounded-md border border-[#374151]">
                  {c}
                  <button onClick={() => setCategories(categories.filter(x => x !== c))}>
                    <X size={10} className="hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TagIcon size={16} className="text-[#3b82f6]" /> Tags
            </h3>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button 
                onClick={handleAddTag}
                className="p-1.5 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] px-2 py-1 rounded-md border border-[#3b82f6]/20">
                  #{t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))}>
                    <X size={10} className="hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Cover Image</h3>
            <div className="border-2 border-dashed border-[#1f2937] rounded-xl p-8 text-center hover:border-[#3b82f6] transition-all cursor-pointer group">
              <ImageIcon className="mx-auto text-[#4b5563] group-hover:text-[#3b82f6] mb-3" size={32} />
              <p className="text-xs text-[#a1a1aa] group-hover:text-white transition-colors">Click to upload or drag and drop</p>
              <p className="text-[10px] text-[#4b5563] mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
