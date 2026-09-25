"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Navigation() {
  const supabase = useMemo(() => createClient(), []);
  const [canManageInventory, setCanManageInventory] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("user_permissions")
        .select("can_manage_inventory")
        .eq("user_id", user.id)
        .maybeSingle();

      setCanManageInventory(data?.can_manage_inventory === true);
    }

    loadPermissions();
  }, [supabase]);

  return (
    <nav
      style={{
        padding: 16,
        borderBottom: "1px solid #ddd",
        display: "flex",
        gap: 16,
      }}
    >
      <Link href="/">Start</Link>
      <Link href="/sattelbestellung">Sattelbestellung</Link>
      <Link href="/musterkarten">Musterkarten</Link>
      <Link href="/fotos">Fotos</Link>

      {canManageInventory && (
        <Link href="/lager">Lagerführung</Link>
      )}
    </nav>
  );
}