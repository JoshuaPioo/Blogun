import { createClient } from "@/app/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import Comments from "../../components/comments";

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (error || !post) return notFound();

  const p = post as PostRow;

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm underline">
          ← Back
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">{p.title}</h1>

        <p className="mt-2 text-xs text-black/60">
          Created: {new Date(p.created_at).toLocaleString()}
          {" · "}
          Updated: {new Date(p.updated_at).toLocaleString()}
        </p>

        <article className="prose mt-6 max-w-none whitespace-pre-wrap">
          {p.content}
        </article>
        <Comments postId={p.id} />
      </div>
    </main>
  );
}
