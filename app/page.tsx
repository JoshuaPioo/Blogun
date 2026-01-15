import Link from "next/link";
import { createClient } from "./lib/supabase/server";

const PAGE_SIZE = 6;

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name: string | null;
};

function excerpt(text: string, max = 160) {
  const t = (text || "").trim();
  return t.length > max ? t.slice(0, max).trimEnd() + "…" : t;
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, q?: string) {
  if (!q) return text;

  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  return text.split(re).map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-black/10 px-1">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Manila timezone (UTC+8) day range
function manilaDayRangeISO(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const startUTC = new Date(Date.UTC(y, m - 1, d, -8));
  const endUTC = new Date(Date.UTC(y, m - 1, d + 1, -8));
  return { start: startUTC.toISOString(), end: endUTC.toISOString() };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; date?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const q = (sp.q || "").trim();
  const date = (sp.date || "").trim();
  const page = Math.max(1, Number(sp.page || "1"));

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // BASE QUERY (community)
  let query = supabase
    .from("posts")
    .select(
      "id, title, content, created_at, author_name",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  // SEARCH: title, content, author
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,content.ilike.%${q}%,author_name.ilike.%${q}%`
    );
  }

  // DATE FILTER (Manila day)
  if (date) {
    const { start, end } = manilaDayRangeISO(date);
    query = query.gte("created_at", start).lt("created_at", end);
  }

  const { data: posts, count } = await query.range(from, to);

  const totalPages = Math.max(
    1,
    Math.ceil((count ?? 0) / PAGE_SIZE)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Blog</h1>

          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl border border-black px-4 py-2 text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-black px-4 py-2 text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-black/20 px-4 py-2 text-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-semibold">Recent Posts</h2>
        <p className="mt-2 text-sm text-black/60">
          Read posts from the community
        </p>

        {/* SEARCH + DATE */}
        <form method="get" className="mt-6 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="page" value="1" />

          <input
            name="q"
            defaultValue={q}
            placeholder="Search title, content, or author…"
            className="rounded-xl border border-black/20 p-3 text-sm"
          />

          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-xl border border-black/20 p-3 text-sm"
          />

          <button className="rounded-xl border border-black px-4 py-2 text-sm">
            Apply
          </button>
        </form>

        {/* POSTS */}
        <div className="mt-8 space-y-6">
          {posts?.map((post: PostRow) => {
            const dateStr = new Date(post.created_at).toLocaleDateString();

            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block rounded-2xl border border-black/10 p-6 hover:border-black/30"
              >
                <h3 className="text-xl font-semibold">
                  {highlightText(post.title, q)}
                </h3>

                <p className="mt-3 text-sm text-black/70">
                  {highlightText(excerpt(post.content), q)}
                </p>

                <p className="mt-4 text-xs text-black/70">
                  {highlightText(post.author_name ?? "Anonymous", q)} ·{" "}
                  {highlightText(dateStr, q)}
                </p>
              </Link>
            );
          })}

          {(!posts || posts.length === 0) && (
            <p className="text-sm text-black/60">No matching posts found.</p>
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;

            const href = `/?q=${encodeURIComponent(
              q
            )}&date=${date}&page=${p}`;

            return (
              <Link
                key={p}
                href={href}
                className={`rounded-xl px-4 py-2 text-sm border ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/20"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
