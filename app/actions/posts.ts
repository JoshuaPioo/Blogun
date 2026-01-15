"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

type CreatePostInput = {
  title: string;
  content: string;
};

type UpdatePostInput = {
  id: string;
  title: string;
  content: string;
};

// helper: get author name from user
function getAuthorName(user: any): string {
  const metaName = (
    user?.user_metadata as { name?: string } | null
  )?.name?.trim();

  if (metaName) return metaName;

  const emailName = user?.email?.split("@")[0];
  if (emailName) return emailName;

  return "Anonymous";
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create a post.");
  }

  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const author_name = getAuthorName(user);

  // INSERT post (RLS enforces owner)
  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    content,
    author_name,
  });

  if (error) throw new Error(error.message);

  // refresh pages
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard");
}

export async function updatePost(input: UpdatePostInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to update a post.");

  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  // UPDATE (RLS ensures owner only)
  const { error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", input.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/dashboard/edit/${input.id}`);
  redirect("/dashboard");
}

export async function deletePost(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to delete a post.");

  // DELETE (RLS ensures owner only)
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/");
}
