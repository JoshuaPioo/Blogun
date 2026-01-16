import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import PostEditForm from "@/app/components/EditForm";

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
    .select("id, title, content, image_url")
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

        <PostEditForm
          id={post.id}
          defaultTitle={post.title}
          defaultContent={post.content}
          defaultImageUrl={post.image_url}
        />
      </div>
    </main>
  );
}
