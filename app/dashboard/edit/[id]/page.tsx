import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { updatePost } from "@/app/actions/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !post) return notFound();

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit Post</h1>
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

            // If user bypasses browser validation, do nothing (no crash)
            if (!title.trim() || !content.trim()) return;

            await updatePost({ id, title, content });
          }}
        >
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              required
              defaultValue={post.title}
              className="mt-2 w-full rounded-xl border border-black/20 p-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              name="content"
              required
              defaultValue={post.content}
              className="mt-2 w-full rounded-xl border border-black/20 p-3"
              rows={10}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black py-3 text-white"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}
