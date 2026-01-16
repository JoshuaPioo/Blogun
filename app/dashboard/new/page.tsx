import Link from "next/link";
import { createPost } from "@/app/actions/posts";
import PostForm from "../../components/PostForm";

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

        <PostForm action={createPost} />
      </div>
    </main>
  );
}
