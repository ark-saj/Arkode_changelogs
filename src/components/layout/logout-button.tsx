"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      className="grid h-10 w-10 place-items-center rounded-full glass text-foreground transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <LogOut className="h-[18px] w-[18px]" />
    </button>
  );
}
