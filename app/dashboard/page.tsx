import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { signOut } from "../actions/auth";

type PostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  author_name: string | null;
  created_at: string;
  read_time: number | null;
};

export default async function DashboardPage() {
  const supabase = await createClient(); // ✅ FIXED

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const userMetadata = user.user_metadata as { name?: string } | null;
  const userName = userMetadata?.name || user.email?.split("@")[0] || "User";

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, excerpt, author_name, created_at, read_time")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold text-black">Blog</div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-black/70">
              Hello, <span className="text-black">{userName}</span>
            </span>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">Recent Posts</h1>
            <p className="mt-2 text-sm text-black/60">
              Share your thoughts with the community
            </p>
          </div>

          <Link
            href="/posts/new"
            className="inline-flex items-center rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
          >
            Create Post
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {(posts ?? []).map((post: PostRow) => (
            <article
              key={post.id}
              className="rounded-xl border border-black/10 bg-white p-6"
            >
              <h2 className="text-xl font-semibold text-black">{post.title}</h2>

              {post.excerpt ? (
                <p className="mt-2 text-sm text-black/70">{post.excerpt}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-black/60">
                <span className="text-black/80">
                  {post.author_name || userName}
                </span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <span>{post.read_time ?? 5} min read</span>
              </div>
            </article>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="rounded-xl border border-black/10 p-10 text-center">
              <p className="text-sm text-black/60">No posts yet.</p>
              <Link href="/posts/new" className="mt-4 inline-block underline text-black">
                Create your first post
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDate(input: string) {
  const d = new Date(input);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
