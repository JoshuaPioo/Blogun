"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  function onSearch(value: string) {
    const q = value.trim();
    const url = q ? `/?q=${encodeURIComponent(q)}` : "/";
    router.push(url);
  }

  return (
    <input
      placeholder="Search by title, author, or date..."
      className="w-full rounded-xl border border-black/20 p-3"
      defaultValue={params.get("q") ?? ""}
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
