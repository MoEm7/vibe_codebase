"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

export default function StudioBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: author } = await supabase
      .from("blog_authors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (author) {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, content, status, created_at")
        .eq("author_id", author.id)
        .order("created_at", { ascending: false });
      if (data) setPosts(data as BlogPost[]);
    }
    setLoading(false);
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      published: "bg-green-100 text-green-700",
      pending_review: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      draft: "bg-gray-100 text-gray-600",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-coffee-dark border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">My Blog Posts</h1>
          <p className="text-coffee-main text-sm mt-1">Share your coffee story with the community</p>
        </div>
        <Link
          href="/studio/blog/new"
          className="px-5 py-2.5 bg-coffee-dark text-white rounded-xl font-bold text-sm no-underline hover:brightness-110 transition-all"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-coffee-main">
          <p className="text-5xl mb-4">✍️</p>
          <p className="text-lg font-medium mb-2">No posts yet</p>
          <p className="text-sm">Share your first story with the community!</p>
          <Link
            href="/studio/blog/new"
            className="inline-block mt-6 px-6 py-3 bg-coffee-dark text-white rounded-xl font-bold text-sm no-underline hover:brightness-110 transition-all"
          >
            Write a Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-bg-card backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-coffee-dark">{post.title}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge(post.status)}`}>
                  {post.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-coffee-main mt-2 line-clamp-2">{post.content}</p>
              <p className="text-xs text-coffee-main mt-3">
                {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
