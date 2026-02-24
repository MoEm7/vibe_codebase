"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  created_at: string;
  blog_authors: { name: string } | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }

  async function approve(postId: string) {
    setActing(postId);
    await fetch(`/api/admin/blog/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setActing(null);
  }

  async function reject(postId: string) {
    setActing(postId);
    await fetch(`/api/admin/blog/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", notes: rejectNotes[postId] || "" }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setShowReject(null);
    setActing(null);
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-coffee-main hover:text-coffee-dark text-sm">← Admin</Link>
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">Blog Approval Queue</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-coffee-main">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg font-medium">All caught up! No pending posts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-bg-card backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)] overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-[800] text-xl text-coffee-dark">{post.title}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">pending review</span>
                </div>
                <p className="text-coffee-main leading-relaxed mb-3">{post.content}</p>
                <p className="text-xs text-coffee-main">
                  ☕ by {post.blog_authors?.name ?? "Unknown"} · {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              {showReject === post.id && (
                <div className="px-6 pb-4 border-t border-pattern-stroke pt-4">
                  <label className="block text-sm font-bold text-coffee-dark mb-2">Feedback for the maker</label>
                  <textarea
                    value={rejectNotes[post.id] ?? ""}
                    onChange={(e) => setRejectNotes((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Tell the maker why this post was rejected..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-pattern-stroke bg-white text-sm text-coffee-dark focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-pattern-stroke">
                {showReject === post.id ? (
                  <>
                    <button onClick={() => setShowReject(null)} className="px-4 py-2 text-sm text-coffee-main hover:text-coffee-dark bg-transparent border-none cursor-pointer">Cancel</button>
                    <button onClick={() => reject(post.id)} disabled={acting === post.id} className="px-5 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all cursor-pointer border-none disabled:opacity-50">
                      {acting === post.id ? "..." : "Confirm Reject"}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowReject(post.id)} className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer bg-transparent">Reject</button>
                    <button onClick={() => approve(post.id)} disabled={acting === post.id} className="px-5 py-2 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all cursor-pointer border-none disabled:opacity-50">
                      {acting === post.id ? "..." : "✅ Approve"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
