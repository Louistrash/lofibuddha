"use client";

export default function HermesPage() {
  const webuiUrl =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
      ? "http://localhost:8787/"
      : "/webui/";

  return (
    <div style={{ height: "calc(100vh - 80px)", width: "100%" }}>
      <iframe
        src={webuiUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "12px",
          background: "#0f0f0f",
        }}
        title="Hermes OS — Full AI Workspace"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
