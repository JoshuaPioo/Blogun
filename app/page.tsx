import { createClient } from "./lib/supabase/server";
import HomeClient from "./components/HomeClient";

const PAGE_SIZE = 6;

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name: string | null;
  image_url: string | null;
};

function manilaDayRangeISO(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const startUTC = new Date(Date.UTC(y, m - 1, d, -8));
  const endUTC = new Date(Date.UTC(y, m - 1, d + 1, -8));
  return { start: startUTC.toISOString(), end: endUTC.toISOString() };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; date?: string; page?: string }>;
}) {
  const sp = await searchParams;

  const q = (sp.q || "").trim();
  const date = (sp.date || "").trim();
  const page = Math.max(1, Number(sp.page || "1"));

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
    "id, title, content, author_name, created_at, image_url",
    { count: "exact" }
  )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,content.ilike.%${q}%,author_name.ilike.%${q}%`
    );
  }

  if (date) {
    const { start, end } = manilaDayRangeISO(date);
    query = query.gte("created_at", start).lt("created_at", end);
  }

  const { data, count } = await query.range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <HomeClient
      userExists={!!user}
      q={q}
      date={date}
      page={page}
      totalPages={totalPages}
      posts={(data ?? []) as PostRow[]}
    />
  );
}
