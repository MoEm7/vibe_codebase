import { createClient } from "@/lib/supabase/server";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select(`id, title, content, slug, published_at, blog_authors(name)`)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-[800] text-4xl text-coffee-dark tracking-[-1.5px] mb-2">Blog</h1>
      <p className="text-coffee-main mb-10">Stories, tips, and updates from our maker community.</p>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-coffee-main">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-medium">No posts yet — check back soon!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="bg-bg-card backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-[0_4px_12px_rgba(62,39,35,0.06)]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-[800] text-xl text-coffee-dark leading-snug">{post.title}</h2>
                <span className="text-xs text-coffee-main whitespace-nowrap mt-1">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : ""}
                </span>
              </div>
              <p className="text-coffee-main leading-relaxed">{post.content}</p>
              {post.blog_authors && (
                <p className="text-xs text-coffee-main mt-4 font-medium">
                  ☕ by {(post.blog_authors as any).name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
