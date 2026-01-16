"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Comments from "../components/comments";

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name: string | null;
  image_url: string | null;
};

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, q?: string) {
  if (!q) return text;
  const query = q.trim();
  if (!query) return text;

  const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
  return text.split(re).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="rounded bg-black/10 px-1 break-words whitespace-normal"
      >
        {part}
      </mark>
    ) : (
      <span key={i} className="break-words whitespace-normal">
        {part}
      </span>
    )
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

export default function HomeClient(props: {
  userExists: boolean;
  q: string;
  date: string;
  page: number;
  totalPages: number;
  posts: PostRow[];
}) {
  const { userExists, q, date, page, totalPages, posts } = props;

  const [open, setOpen] = useState(false);
  const [activePost, setActivePost] = useState<PostRow | null>(null);

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const openPost = (post: PostRow) => {
    setActivePost(post);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setActivePost(null);
  };

  // lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAV */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <h1 className="text-lg font-semibold">Blogun</h1>

          {userExists ? (
            <Link
              href="/dashboard"
              className="rounded-xl border border-black px-4 py-2 text-sm"
            >
              My Blogs
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
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold">Recent Posts</h2>
            <p className="mt-2 text-sm text-black/60">
              Read posts from the community
            </p>
          </div>
        </div>

        {/* Filters */}
        <form
          method="get"
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="page" value="1" />

          <div className="relative w-full sm:flex-1 min-w-0">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title, content, or author…"
              className="w-full min-w-0 rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-black/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                name="date"
                defaultValue={date}
                className="absolute inset-0 h-full w-full opacity-0"
                aria-label="Filter by date"
              />

              <button
                type="button"
                onClick={() =>
                  dateInputRef.current?.showPicker?.() ||
                  dateInputRef.current?.click()
                }
                className="flex items-center justify-center rounded-2xl border border-black/15 bg-white p-3 text-black/70 outline-none hover:border-black/30"
                title="Pick a date"
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
            </div>

            <button className="cursor-pointer rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90">
              Apply
            </button>

            {(q || date) && (
              <Link
                href="/"
                className="rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm text-black/70 hover:border-black/30"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* POSTS */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6">
          {posts.map((post) => {
            const dateStr = new Date(post.created_at).toLocaleDateString();

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => openPost(post)}
                className="cursor-pointer w-full min-w-0 text-left rounded-2xl border border-black/10 p-4 sm:p-6 transition hover:border-black/30 overflow-hidden"
              >
                {/* ✅ Title (your current good behavior): ~2 lines, no plugin */}
                <h3
                  className="
                    min-w-0
                    text-base sm:text-lg md:text-xl
                    font-semibold
                    leading-snug
                    break-words
                    overflow-hidden
                    max-h-[3.2em]
                  "
                >
                  {highlightText(post.title, q)}
                </h3>

                {/* ✅ Content (same style logic as title, just different font/height) */}
                <p
                  className="
                    mt-2 sm:mt-3
                    min-w-0
                    text-sm sm:text-base
                    text-black/70
                    leading-relaxed
                    break-words
                    overflow-hidden
                    max-h-[4.5em] sm:max-h-[6em]
                  "
                >
                  {highlightText(post.content, q)}
                </p>

                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image_url}
                    alt=""
                    className="mt-4 w-full max-h-[260px] object-cover rounded-2xl border border-black/10"
                  />
                )}

                <p className="mt-4 text-xs text-black/70 break-words">
                  {highlightText(post.author_name ?? "Anonymous", q)} ·{" "}
                  {highlightText(dateStr, q)}
                </p>
              </button>
            );
          })}

          {posts.length === 0 && (
            <p className="text-sm text-black/60">No matching posts found.</p>
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            const href = `/?q=${encodeURIComponent(q)}&date=${date}&page=${p}`;

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

      {/* MODAL */}
      {open && activePost && (
        <div
          className="fixed inset-0 z-50 p-4 overflow-x-hidden"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 border-b border-black/10 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-semibold break-words">
                    {activePost.title}
                  </h2>
                  <p className="mt-1 text-xs text-black/60">
                    {activePost.author_name ?? "Anonymous"} ·{" "}
                    {new Date(activePost.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={close}
                  className="shrink-0 rounded-2xl border border-black/15 px-3 py-2 text-sm hover:border-black/30"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
              {activePost.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePost.image_url}
                  alt=""
                  className="mb-5 w-full max-h-[420px] object-cover rounded-2xl border border-black/10"
                />
              )}

              <div className="whitespace-pre-wrap break-words text-sm leading-6 text-black/80">
                {activePost.content}
              </div>

              <Comments postId={activePost.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
