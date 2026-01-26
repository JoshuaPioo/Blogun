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

  
 function friendlyAuthError(message: string) {
   const msg = (message || "").toLowerCase();

   // Password policy (weak password / complexity)
   if (msg.includes("password")) {
     return "Password must be at least 6 characters and include: 1 uppercase, 1 lowercase, 1 number, and 1 symbol.";
   }

   // Invalid email format
   if (
     msg.includes("email") &&
     (msg.includes("invalid") || msg.includes("format"))
   ) {
     return "Please enter a valid email address.";
   }

   // Login credentials
   if (msg.includes("invalid login credentials")) {
     return "Incorrect email or password.";
   }

   return "Something went wrong. Please try again.";
 }

 async function emailExists(email: string) {
   const target = email.toLowerCase().trim();

   let page = 1;
   const perPage = 200;

   while (true) {
     const { data, error } = await supabaseAdmin.auth.admin.listUsers({
       page,
       perPage,
     });

     if (error) throw new Error(error.message);

     const users = data?.users ?? [];
     const found = users.some((u) => (u.email ?? "").toLowerCase() === target);
     if (found) return true;

     if (users.length < perPage) return false;

     page++;
     if (page > 50) return false;
   }
 }

 export async function signUp(formData: FormData) {
   const supabase = await createClient();

   const name = String(formData.get("name") || "").trim();
   const email = String(formData.get("email") || "")
     .trim()
     .toLowerCase();
   const password = String(formData.get("password") || "");

   if (!name || !email || !password) {
     return { error: "All fields are required." };
   }

   //  Duplicate check
   try {
     const exists = await emailExists(email);
     if (exists) {
       return { error: "Email is already registered." };
     }
   } catch (e: any) {
     return { error: e?.message ?? "Duplicate check failed." };
   }

   //  Proceed signup (keeps verification link)
   const { error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: { name },
       emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
     },
   });

   if (error) {
     return { error: friendlyAuthError(error.message) };
   }

   redirect("/check-email");
 }



export const signOut = async () => {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
};
