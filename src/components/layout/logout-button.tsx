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
      className="grid h-9 w-9 place-items-center rounded-md9 border border-line-2 text-ink transition hover:-translate-y-px hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/30"
    >
      <LogOut className="h-[18px] w-[18px]" />
    </button>
  );
}
