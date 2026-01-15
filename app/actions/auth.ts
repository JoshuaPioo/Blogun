"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "../lib/supabase/admin";

export const signIn = async (formData: FormData) => {
  const supabase = await createClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
};


 async function emailExists(email: string) {
   const target = email.toLowerCase().trim();

   let page = 1;
   const perPage = 200; // max-ish batch

   while (true) {
     const { data, error } = await supabaseAdmin.auth.admin.listUsers({
       page,
       perPage,
     });

     if (error) throw new Error(error.message);

     const users = data?.users ?? [];
     const found = users.some((u) => (u.email ?? "").toLowerCase() === target);
     if (found) return true;

     // if less than perPage, no more pages
     if (users.length < perPage) return false;

     page++;
     // safety: avoid infinite loop (super unlikely)
     if (page > 50) return false;
   }
 }

 export async function signUp(formData: FormData) {
   const supabase = await createClient();

   const name = String(formData.get("name") || "").trim();
   const email = String(formData.get("email") || "").trim();
   const password = String(formData.get("password") || "");

   if (!name || !email || !password) {
     return { error: "All fields are required." };
   }

   // ✅ Duplicate check (works on older supabase-js types)
   try {
     const exists = await emailExists(email);
     if (exists) {
       return { error: "Email is already registered." };
     }
   } catch (e: any) {
     return { error: e?.message ?? "Duplicate check failed." };
   }

   // ✅ Proceed signup (keeps verification link)
   const { error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: { name },
       emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
     },
   });

   if (error) {
     return { error: error.message };
   }

   return { ok: true };
 }



export const signOut = async () => {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
};
