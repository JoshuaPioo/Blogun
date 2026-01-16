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
  image_url: string | null;
  created_at: string;
};

export async function getComments(
  postId: string
): Promise<{ data?: CommentRow[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, author_name, body, image_url, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: (data ?? []) as CommentRow[] };
}

export async function createComment(
  formData: FormData
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please login to comment." };

  const postId = String(formData.get("postId") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!postId) return { error: "Missing post id." };
  if (!body) return { error: "Comment is required." };

  // optional image
  const file = formData.get("image") as File | null;
  let image_url: string | null = null;

  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "Image file only." };

    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) return { error: "Image is too large. Max 2MB." };

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("comment-images")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) return { error: uploadError.message };

    image_url = supabase.storage.from("comment-images").getPublicUrl(path)
      .data.publicUrl;
  }

  const author_name = getDisplayName(user);

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    author_name,
    body,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);

  return { ok: true };
}

export async function deleteComment(input: { id: string; postId: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please login." };

  const { error } = await supabase.from("comments").delete().eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/post/${input.postId}`);

  return { ok: true };
}
