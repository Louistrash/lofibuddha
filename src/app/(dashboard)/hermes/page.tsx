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
        background: "#0f0f0f",
        display: "block",
      }}
      title="Hermes OS — Full AI Workspace"
      allow="clipboard-read; clipboard-write"
    />
  );
}
