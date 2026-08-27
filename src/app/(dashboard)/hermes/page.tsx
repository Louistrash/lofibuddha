"use client";

export default function HermesPage() {
  const webuiUrl =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
      ? "http://localhost:8787/"
      : "/webui/";

  return (
    <iframe
      src={webuiUrl}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        background: "var(--bg-surface)",
        display: "block",
      }}
      title="Hermes OS — Full AI Workspace"
      allow="clipboard-read; clipboard-write"
    />
  );
}
