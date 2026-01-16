import Link from "next/link";
import { createPost } from "@/app/actions/posts";

export default function NewPostPage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create New Post</h1>
          <Link href="/dashboard" className="text-sm underline">
            Cancel
          </Link>
        </div>

        <form
          className="mt-6 space-y-4 rounded-2xl border border-black/15 p-6"
          action={async (formData) => {
            "use server";
            const title = String(formData.get("title") || "");
            const content = String(formData.get("content") || "");
            await createPost({ title, content });
          }}
        >
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              className="mt-2 w-full rounded-xl border border-black/20 p-3"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              name="content"
              className="mt-2 w-full rounded-xl border border-black/20 p-3"
              rows={10}
              placeholder="Write your post content..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-black py-3 text-white"
          >
            Create Post
          </button>
        </form>
      </div>
    </main>
  );
}
