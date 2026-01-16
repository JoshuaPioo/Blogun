"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

function getDisplayName(user: any) {
  const metaName = (
    user?.user_metadata as { name?: string } | null
  )?.name?.trim();
  if (metaName) return metaName;

  const emailName = user?.email?.split("@")[0];
  if (emailName) return emailName;

  return "User";
}

export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string | null;
  body: string;
  created_at: string;
};

export async function getComments(
  postId: string
): Promise<{ data?: CommentRow[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, author_name, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: (data ?? []) as CommentRow[] };
}

export async function createComment(input: { postId: string; body: string }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please login to comment." };

  const body = input.body.trim();
  if (!body) return { error: "Comment is required." };

  const author_name = getDisplayName(user);

  const { error } = await supabase.from("comments").insert({
    post_id: input.postId,
    user_id: user.id,
    author_name,
    body,
  });

  if (error) return { error: error.message };

  // Refresh pages that show comments
  revalidatePath("/");
  revalidatePath(`/post/${input.postId}`);

  return { ok: true };
}

export async function deleteComment(input: { id: string; postId: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please login." };

  // RLS will ensure only owner can delete
  const { error } = await supabase.from("comments").delete().eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/post/${input.postId}`);

  return { ok: true };
}
