"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_CHARS = 250;

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const charsLeft = MAX_CHARS - content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    if (content.length > MAX_CHARS) { setError(`Content must be ${MAX_CHARS} characters or less.`); return; }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to submit post.");
      setSubmitting(false);
      return;
    }

    router.push("/studio/blog");
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/studio/blog" className="text-coffee-main hover:text-coffee-dark transition-colors text-sm">
          ← Back
        </Link>
        <h1 className="font-[800] text-3xl text-coffee-dark tracking-[-1px]">Write a Post</h1>
      </div>

      <div className="bg-bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-[0_8px_24px_rgba(62,39,35,0.06)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-coffee-dark mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-pattern-stroke bg-white/80 text-coffee-dark placeholder:text-coffee-main/50 font-medium focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-coffee-dark">Your Post</label>
              <span className={`text-xs font-bold ${charsLeft < 20 ? "text-red-500" : "text-coffee-main"}`}>
                {charsLeft} characters left
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Share your coffee story, tip, or update... (max 250 characters)"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-pattern-stroke bg-white/80 text-coffee-dark placeholder:text-coffee-main/50 font-medium focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
              <div
                className={`h-1 rounded-full transition-all ${charsLeft < 20 ? "bg-red-400" : "bg-accent"}`}
                style={{ width: `${(content.length / MAX_CHARS) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-coffee-main">
              📋 Posts are reviewed before going live on the blog.
            </p>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-8 py-3 bg-coffee-dark text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {submitting ? "Submitting..." : "Submit Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
