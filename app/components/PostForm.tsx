"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ ok?: true; error?: string }>;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);

    const res = await action(formData);

    setLoading(false);

    // ❌ validation error → do nothing (stay on page)
    if (res?.error) {
      return;
    }

    // ✅ success → redirect
    router.push("/dashboard");
  }

  return (
    <form
      className="mt-6 space-y-4 rounded-2xl border border-black/15 p-6"
      action={onSubmit}
    >
      <div>
        <label className="text-sm font-medium">
          Title{" "}
          <span className="text-xs text-black/50">(max 50 characters)</span>
        </label>

        <input
          name="title"
          maxLength={50}
          className="mt-2 w-full rounded-xl border border-black/20 p-3"
          placeholder="Enter post title"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Content{" "}
          <span className="text-xs text-black/50">(max 100 characters)</span>
        </label>

        <textarea
          name="content"
          maxLength={100}
          className="mt-2 w-full rounded-xl border border-black/20 p-3"
          rows={6}
          placeholder="Write your post content..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Photo</label>

        <label
          htmlFor="image"
          className={`mt-2 flex cursor-pointer items-center justify-center rounded-xl border px-4 py-6 text-sm transition
            ${
              fileName
                ? "border-black bg-black text-white"
                : "border-dashed border-black/30 bg-white text-black/70 hover:border-black hover:text-black"
            }`}
        >
          {fileName ? `Selected: ${fileName}` : "Click to upload image"}
        </label>

        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFileName(f?.name ?? "");
          }}
        />

        <p className="mt-2 text-xs text-black/50">
          Optional. PNG / JPG / WebP (max 2MB)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer rounded-xl bg-black py-3 text-white disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Post"}
      </button>
    </form>
  );
}
