"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LagerPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("user_permissions")
        .select("can_manage_inventory")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || data?.can_manage_inventory !== true) {
        router.replace("/");
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    checkPermission();
  }, [router, supabase]);

  if (loading) {
    return <main style={{ padding: 30 }}>Lade...</main>;
  }

  if (!allowed) {
    return null;
  }

  return (
    <main style={{ padding: 30 }}>
      <h1 style={{ fontWeight: "bold", fontSize: 24 }}>
        Lagerführung
      </h1>

      <p style={{ marginTop: 16 }}>
        Lagerverwaltung 3S-Sattel
      </p>
    </main>
  );
}