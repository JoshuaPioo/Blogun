import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { deletePost } from "../actions/posts";
import { signOut } from "../actions/auth";

const PAGE_SIZE = 6;

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

function excerpt(text: string, max = 160) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
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

// PH timezone day range
function manilaDayRangeISO(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const startUTC = new Date(Date.UTC(y, m - 1, d, -8));
  const endUTC = new Date(Date.UTC(y, m - 1, d + 1, -8));
  return { start: startUTC.toISOString(), end: endUTC.toISOString() };
}

export default async function DashboardPage({
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

  if (!user) {
    return <main className="p-10">Please login.</main>;
  }

  const metaName =
    (user.user_metadata as { name?: string } | null)?.name ||
    user.email?.split("@")[0];

  let query = supabase
    .from("posts")
    .select("id, title, content, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  if (date) {
    const { start, end } = manilaDayRangeISO(date);
    query = query.gte("created_at", start).lt("created_at", end);
  }

  const { data: posts, count } = await query.range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-black/60">Dashboard</p>
            <h1 className="text-xl font-semibold">Hello, {metaName}</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-xl border border-black/20 px-4 py-2 text-sm"
            >
              Community
            </Link>
            <form action={signOut}>
              <button className="rounded-xl border border-black px-4 py-2 text-sm">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* TITLE */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold">Your Posts</h2>
          <Link
            href="/dashboard/new"
            className="rounded-xl bg-black px-6 py-3 text-sm text-white"
          >
            Create Post
          </Link>
        </div>

        {/* FILTERS */}
        <form method="get" className="mt-6 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="page" value="1" />

          <input
            name="q"
            defaultValue={q}
            placeholder="Search title or content"
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
          {posts?.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-black/10 p-6"
            >
              <h3 className="text-xl font-semibold">
                {highlightText(post.title, q)}
              </h3>
              <p className="mt-3 text-sm text-black/70">
                {highlightText(excerpt(post.content), q)}
              </p>

              <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-black/50">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/edit/${post.id}`}
                    className="rounded-xl border border-black/20 px-4 py-2 text-sm"
                  >
                    Edit
                  </Link>

                  <form
                    action={async () => {
                      "use server";
                      await deletePost(post.id);
                    }}
                  >
                    <button className="rounded-xl border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;

            const href = `/dashboard?q=${encodeURIComponent(
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
