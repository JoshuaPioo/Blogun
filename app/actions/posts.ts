"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

type UpdatePostInput = {
  id: string;
  title: string;
  content: string;
};

// helper: get author name from user
function getAuthorName(user: any): string {
  const meta = user?.user_metadata as { name?: string } | null;

  const metaName = meta?.name?.trim();
  if (metaName) return metaName;

  const emailName = user?.email?.split("@")[0]?.trim();
  if (emailName) return emailName;

  return "Anonymous";
}

function normalize(v: unknown) {
  return String(v ?? "").trim();
}

function validateTitleAndContent(title: string, content: string): string | null {
  if (!title || !content) return "Title and content are required.";
  if (title.length > 50) return "Title must be 50 characters or less.";
  if (content.length > 100) return "Content must be 100 characters or less.";
  return null;
}

export async function createPost(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "You must be logged in to create a post." };

  const title = normalize(formData.get("title"));
  const content = normalize(formData.get("content"));

  const validationError = validateTitleAndContent(title, content);
  if (validationError) return { error: validationError };

  const author_name = getAuthorName(user);

  // IMAGE (optional)
  const file = formData.get("image") as File | null;
  let image_url: string | null = null;

  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "Image file only." };

    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) return { error: "Image is too large. Max 2MB." };

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    image_url = data.publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    content,
    author_name,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

export async function updatePost(
  formData: FormData
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to update a post." };

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!id) return { error: "Missing post id." };

  const validationError = validateTitleAndContent(title, content);
  if (validationError) return { error: validationError };

  // OPTIONAL image replace
  const file = formData.get("image") as File | null;
  let image_url: string | undefined = undefined;

  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "Image file only." };

    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) return { error: "Image is too large. Max 2MB." };

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) return { error: uploadError.message };

    image_url = supabase.storage.from("post-images").getPublicUrl(path)
      .data.publicUrl;
  }

  const updatePayload: any = { title, content };
  if (image_url !== undefined) updatePayload.image_url = image_url;

  const { error } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/dashboard/edit/${id}`);
  return { ok: true };
}


export async function deletePost(id: string): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to delete a post." };

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}
