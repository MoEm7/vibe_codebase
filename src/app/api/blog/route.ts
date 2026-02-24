import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`*, blog_authors(name, avatar_url)`)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const serviceClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "maker") {
    return NextResponse.json({ error: "Only makers can post blogs" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  if (content.length > 250) {
    return NextResponse.json({ error: "Content must be 250 characters or less" }, { status: 400 });
  }

  let { data: author } = await serviceClient
    .from("blog_authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    const { data: newAuthor, error: authorError } = await serviceClient
      .from("blog_authors")
      .insert({ user_id: user.id, name: userData.display_name || "Maker" })
      .select("id")
      .single();
    if (authorError) return NextResponse.json({ error: authorError.message }, { status: 500 });
    author = newAuthor;
  }

  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

  const { data: post, error } = await serviceClient
    .from("blog_posts")
    .insert({
      author_id: author!.id,
      slug,
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().substring(0, 100),
      status: "pending_review",
      locale: "en",
      tags: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(post, { status: 201 });
}
