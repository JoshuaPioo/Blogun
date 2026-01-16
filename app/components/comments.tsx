"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createComment,
  deleteComment,
  getComments,
  type CommentRow,
} from "../actions/comments";

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const res = await getComments(postId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setComments(res.data ?? []);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <section className="mt-8 border-t border-black/10 pt-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-base font-semibold sm:text-lg">Comments</h3>
        <p className="text-xs text-black/50">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </p>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-red-400 bg-white p-3 text-sm text-black break-words">
          {error}
        </div>
      )}

      {/* Add comment */}
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);

          const body = text.trim();
          if (!body) {
            setError("Comment is required.");
            return;
          }

          startTransition(async () => {
            const res = await createComment({ postId, body });
            if (res?.error) {
              setError(res.error);
              return;
            }
            setText("");
            load();
          });
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Write a comment…"
          className="w-full max-w-full resize-y rounded-2xl border border-black/15 p-3 text-sm leading-6 outline-none focus:border-black/30"
          required
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>

          <p className="text-xs text-black/50">
            Tip: long words will wrap automatically.
          </p>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 space-y-4">
        {comments.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-black/10 p-4 sm:p-5"
          >
            {/* Mobile: stack. Desktop: row. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {/* IMPORTANT: min-w-0 allows wrapping inside flex */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium break-words">
                  {c.author_name ?? "User"}
                </p>

                {/* Handles long text safely */}
                <p className="mt-1 text-sm text-black/80 leading-6 whitespace-pre-wrap break-words overflow-hidden">
                  {c.body}
                </p>

                <p className="mt-2 text-xs text-black/50 break-words">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      const res = await deleteComment({ id: c.id, postId });
                      if (res?.error) {
                        setError(res.error);
                        return;
                      }
                      load();
                    });
                  }}
                  className="w-full rounded-xl border border-red-500 px-3 py-2 text-xs text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60 sm:w-auto"
                  disabled={isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-black/60">No comments yet.</p>
        )}
      </div>
    </section>
  );
}
