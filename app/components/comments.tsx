"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
  type CommentRow,
} from "../actions/comments";

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editFileName, setEditFileName] = useState("");

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

  const resetNewFile = () => {
    setFileName("");
    const fileInput = document.getElementById(
      "comment-image"
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const resetEditFile = (id: string) => {
    setEditFileName("");
    const fileInput = document.getElementById(
      `edit-image-${id}`
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

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
        action={(formData) => {
          setError(null);

          const body = text.trim();
          if (!body) {
            setError("Comment is required.");
            return;
          }

          formData.set("postId", postId);
          formData.set("body", body);

          startTransition(async () => {
            const res = await createComment(formData);
            if (res?.error) {
              setError(res.error);
              return;
            }

            setText("");
            resetNewFile();
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

        {/* optional image */}
        <div>
          <label className="text-sm font-medium">Photo (optional)</label>

          <label
            htmlFor="comment-image"
            className={`mt-2 flex cursor-pointer items-center justify-center rounded-xl border px-4 py-4 text-sm transition
              ${
                fileName
                  ? "border-black bg-black text-white"
                  : "border-dashed border-black/30 bg-white text-black/70 hover:border-black hover:text-black"
              }`}
          >
            {fileName ? `Selected: ${fileName}` : "Click to upload image"}
          </label>

          <input
            id="comment-image"
            name="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f?.name ?? "");
            }}
          />

          <p className="mt-2 text-xs text-black/50">Max 2MB. PNG/JPG/WebP.</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* List */}
      <div className="mt-6 space-y-4">
        {comments.map((c) => {
          const isEditing = editingId === c.id;

          return (
            <article
              key={c.id}
              className="rounded-2xl border border-black/10 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words">
                    {c.author_name ?? "User"}
                  </p>

                  {!isEditing ? (
                    <>
                      <p className="mt-1 text-sm text-black/80 leading-6 whitespace-pre-wrap break-words overflow-hidden">
                        {c.body}
                      </p>

                      {c.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image_url}
                          alt=""
                          className="mt-3 w-full max-h-[260px] object-cover rounded-2xl border border-black/10"
                        />
                      )}

                      <p className="mt-2 text-xs text-black/50 break-words">
                        {new Date(c.created_at).toLocaleString()}
                        {c.edited_at ? " · edited" : ""}
                      </p>
                    </>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-2xl border border-black/15 p-3 text-sm leading-6 outline-none focus:border-black/30"
                      />

                      {/* optional replace image */}
                      <div>
                        <label className="text-xs text-black/60">
                          Replace photo (optional)
                        </label>

                        <label
                          htmlFor={`edit-image-${c.id}`}
                          className={`mt-2 flex cursor-pointer items-center justify-center rounded-xl border px-4 py-4 text-xs transition
                            ${
                              editFileName
                                ? "border-black bg-black text-white"
                                : "border-dashed border-black/30 bg-white text-black/70 hover:border-black hover:text-black"
                            }`}
                        >
                          {editFileName
                            ? `Selected: ${editFileName}`
                            : "Click to upload new image"}
                        </label>

                        <input
                          id={`edit-image-${c.id}`}
                          name="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setEditFileName(f?.name ?? "");
                          }}
                        />

                        <p className="mt-2 text-xs text-black/50">
                          If you don’t upload, old photo stays.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            const body = editText.trim();
                            if (!body) {
                              setError("Comment is required.");
                              return;
                            }

                            const fd = new FormData();
                            fd.set("id", c.id);
                            fd.set("postId", postId);
                            fd.set("body", body);

                            const fileInput = document.getElementById(
                              `edit-image-${c.id}`
                            ) as HTMLInputElement | null;

                            const f = fileInput?.files?.[0];
                            if (f) fd.set("image", f);

                            startTransition(async () => {
                              const res = await updateComment(fd);
                              if (res?.error) {
                                setError(res.error);
                                return;
                              }
                              setEditingId(null);
                              setEditText("");
                              resetEditFile(c.id);
                              load();
                            });
                          }}
                          className="rounded-xl bg-black px-4 py-2 text-xs text-white disabled:opacity-60"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                            resetEditFile(c.id);
                          }}
                          className="rounded-xl border border-black/20 px-4 py-2 text-xs hover:border-black/30 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {/* Edit */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setError(null);
                      setEditingId(c.id);
                      setEditText(c.body);
                      setEditFileName("");
                      resetEditFile(c.id);
                    }}
                    className="w-full rounded-xl border border-black/20 px-3 py-2 text-xs hover:border-black/30 disabled:opacity-60 sm:w-auto"
                  >
                    Edit
                  </button>

                  {/* Delete */}
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
          );
        })}

        {comments.length === 0 && (
          <p className="text-sm text-black/60">No comments yet.</p>
        )}
      </div>
    </section>
  );
}
