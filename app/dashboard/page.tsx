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
  image_url: string | null;
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

function SearchIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 21l-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function CalendarIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 2v3M16 2v3" />
      <path d="M3 9h18" />
      <path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    </svg>
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
    .select("id, title, content, created_at, image_url", { count: "exact" })
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
              <button className="rounded-xl border border-black px-4 py-2 text-sm cursor-pointer">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* TITLE */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Your Posts</h2>
          <Link
            href="/dashboard/new"
            className="rounded-xl bg-black px-6 py-3 text-sm text-white hover:opacity-90"
          >
            Create Post
          </Link>
        </div>

        {/* MODERN FILTERS */}
        <form
          method="get"
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="page" value="1" />

          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title or content…"
              className="w-full rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-black/40"
            />
          </div>

          {/* Date (icon only) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="date"
                type="date"
                name="date"
                defaultValue={date}
                className="cursor-pointer absolute inset-0 h-full w-full opacity-0"
              />

              <label
                htmlFor="date"
                className="flex items-center justify-center rounded-2xl border border-black/15 bg-white p-3 text-black/70 hover:border-black/30"
                title="Pick a date"
              >
                <CalendarIcon className="h-5 w-5" />
              </label>
            </div>

            <button className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 cursor-pointer">
              Apply
            </button>

            {(q || date) && (
              <Link
                href="/dashboard"
                className="rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm text-black/70 hover:border-black/30"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* POSTS */}
        <div className="mt-8 space-y-6">
          {posts?.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-black/10 p-6 transition hover:border-black/20"
            >
              {/* ✅ Responsive title: wrap + clamp */}
              <h3 className="text-xl font-semibold break-words line-clamp-2">
                {highlightText(post.title, q)}
              </h3>

              {/* ✅ Responsive content: wrap + clamp */}
              <p className="mt-3 text-sm text-black/70 break-words line-clamp-3">
                {highlightText(excerpt(post.content), q)}
              </p>

              {post.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image_url}
                  alt=""
                  className="mt-4 w-full max-h-[260px] object-cover rounded-2xl border border-black/10"
                />
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-black/50">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/edit/${post.id}`}
                    className="rounded-xl border border-black/20 px-4 py-2 text-sm hover:border-black/30"
                  >
                    Edit
                  </Link>

                  <form
                    action={async () => {
                      "use server";
                      await deletePost(post.id);
                    }}
                  >
                    <button className="rounded-xl border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-600 hover:text-white cursor-pointer">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {(!posts || posts.length === 0) && (
            <p className="text-sm text-black/60">No matching posts found.</p>
          )}
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
                  active ? "border-black bg-black text-white" : "border-black/20"
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
