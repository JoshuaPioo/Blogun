"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePost } from "@/app/actions/posts";

export default function PostEditForm(props: {
  id: string;
  defaultTitle: string;
  defaultContent: string;
  defaultImageUrl: string | null;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);

    // include id in formData so server action can read it
    formData.set("id", props.id);

    const res = await updatePost(formData);

    setLoading(false);

    // no alert: stay on page if invalid
    if (res?.error) return;

    router.push("/dashboard");
  }

  return (
    <form
      className="mt-6 space-y-4 rounded-2xl border border-black/15 p-6"
      action={onSubmit}
    >
      <div>
        <label className="text-sm font-medium">
          Title <span className="text-xs text-black/50">(max 50)</span>
        </label>
        <input
          name="title"
          required
          maxLength={50}
          defaultValue={props.defaultTitle}
          className="mt-2 w-full rounded-xl border border-black/20 p-3"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Content <span className="text-xs text-black/50">(max 100)</span>
        </label>
        <textarea
          name="content"
          required
          maxLength={100}
          defaultValue={props.defaultContent}
          className="mt-2 w-full rounded-xl border border-black/20 p-3"
          rows={6}
        />
      </div>

      {/* Current photo preview */}
      {props.defaultImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.defaultImageUrl}
          alt=""
          className="w-full max-h-[260px] object-cover rounded-2xl border border-black/10"
        />
      )}

      {/* Photo upload (same UI as New) */}
      <div>
        <label className="text-sm font-medium">Replace Photo</label>

        <label
          htmlFor="image"
          className={`mt-2 flex cursor-pointer items-center justify-center rounded-xl border px-4 py-6 text-sm transition
            ${
              fileName
                ? "border-black bg-black text-white"
                : "border-dashed border-black/30 bg-white text-black/70 hover:border-black hover:text-black"
            }`}
        >
          {fileName ? `Selected: ${fileName}` : "Click to upload new image"}
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
          Optional. If you don’t upload, the old photo stays.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
