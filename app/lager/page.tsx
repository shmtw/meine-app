"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Saddle = {
  sattelNr: string;
  datum: string;
  art: string;
  sattlerei: string;
  orderNo: string;
  baum: string;
  sonstiges: string;
};

type LagerResponse = {
  success: boolean;
  count: number;
  saddles: Saddle[];
  error?: string;
};

type AbgleichResponse = {
  success: boolean;
  message?: string;
  geprueft?: number;
  aktualisiert?: number;
  saddles?: {
    sattelNr: string;
    art: string;
    dealIds: string[];
  }[];
  error?: string;
};

export default function LagerPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [saddles, setSaddles] = useState<Saddle[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [abgleichLoading, setAbgleichLoading] = useState(false);
  const [abgleichMessage, setAbgleichMessage] = useState("");

  async function loadLager() {
    const response = await fetch("/api/lager", {
      cache: "no-store",
    });

    const result: LagerResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Lagerbestand konnte nicht geladen werden"
      );
    }

    setSaddles(result.saddles);
  }

  useEffect(() => {
    async function start() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: permissionError } = await supabase
        .from("user_permissions")
        .select("can_manage_inventory")
        .eq("user_id", user.id)
        .maybeSingle();

      if (
        permissionError ||
        data?.can_manage_inventory !== true
      ) {
        router.replace("/");
        return;
      }

      setAllowed(true);

      try {
        await loadLager();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unbekannter Fehler"
        );
      } finally {
        setLoading(false);
      }
    }

    start();
  }, [router, supabase]);

  async function handleAbgleich() {
    setAbgleichLoading(true);
    setAbgleichMessage("");
    setError("");

    try {
      const response = await fetch("/api/lager/abgleich", {
        cache: "no-store",
      });

      const result: AbgleichResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Lagerabgleich fehlgeschlagen"
        );
      }

      if ((result.aktualisiert ?? 0) === 0) {
        setAbgleichMessage(
          `Lagerbestand ist aktuell. ${result.geprueft ?? 0} Sättel geprüft.`
        );
      } else {
        setAbgleichMessage(
          `${result.aktualisiert} ${
            result.aktualisiert === 1
              ? "verkaufter Sattel wurde"
              : "verkaufte Sättel wurden"
          } aktualisiert.`
        );
      }

      // Lagerliste danach neu laden.
      // Verkaufte Sättel verschwinden dadurch sofort.
      await loadLager();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unbekannter Fehler"
      );
    } finally {
      setAbgleichLoading(false);
    }
  }

  const filteredSaddles = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return saddles;
    }

    return saddles.filter((saddle) => {
      const searchable = [
        saddle.sattelNr,
        saddle.art,
        saddle.sattlerei,
        saddle.orderNo,
        saddle.baum,
        saddle.sonstiges,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [saddles, search]);

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Lagerführung</h1>
        <p>Lagerbestand wird geladen...</p>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Lagerführung</h1>

      {/* Statistik + Abgleich */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "stretch",
          marginTop: "25px",
          marginBottom: "30px",
        }}
      >
        <Stat
          label="Aktuell auf Lager"
          value={saddles.length}
        />

        <button
          onClick={handleAbgleich}
          disabled={abgleichLoading}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "15px 25px",
            minWidth: "190px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: abgleichLoading
              ? "not-allowed"
              : "pointer",
            background: abgleichLoading
              ? "#999"
              : "#234f3d",
            color: "white",
          }}
        >
          {abgleichLoading
            ? "Abgleich läuft..."
            : "Jetzt abgleichen"}
        </button>
      </div>

      {abgleichMessage && (
        <div
          style={{
            marginBottom: "25px",
            padding: "14px 18px",
            border: "1px solid #b8d6c8",
            borderRadius: "8px",
            background: "#f2faf6",
          }}
        >
          {abgleichMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "25px",
            padding: "14px 18px",
            border: "1px solid #d8aaaa",
            borderRadius: "8px",
            background: "#fff5f5",
            color: "#900",
          }}
        >
          {error}
        </div>
      )}

      {/* Suche */}

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Sattelnummer, Modell, Sattlerei, Order No, Baum oder Sonstiges suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #bbb",
            borderRadius: "5px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <p style={{ marginBottom: "20px" }}>
        Angezeigt: <strong>{filteredSaddles.length}</strong>
      </p>

      {/* Tabellenkopf */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1.4fr 1.2fr 1fr 2fr 2fr",
          gap: "10px",
          fontWeight: "bold",
          padding: "10px 0",
          borderBottom: "2px solid #333",
        }}
      >
        <div>Sattel-Nr.</div>
        <div>Art</div>
        <div>Sattlerei</div>
        <div>Order No</div>
        <div>Baum</div>
        <div>Sonstiges</div>
      </div>

      {/* Lagerbestand */}

      {filteredSaddles.map((saddle) => (
        <div
          key={saddle.sattelNr}
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1.4fr 1.2fr 1fr 2fr 2fr",
            gap: "10px",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div>
            <strong>{saddle.sattelNr}</strong>
          </div>

          <div>{saddle.art || "–"}</div>
          <div>{saddle.sattlerei || "–"}</div>
          <div>{saddle.orderNo || "–"}</div>
          <div>{saddle.baum || "–"}</div>
          <div>{saddle.sonstiges || "–"}</div>
        </div>
      ))}

      {filteredSaddles.length === 0 && (
        <p style={{ marginTop: "25px" }}>
          Keine passenden Sättel gefunden.
        </p>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px 25px",
        minWidth: "170px",
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: "24px",
        }}
      >
        {value}
      </strong>

      {label}
    </div>
  );
}