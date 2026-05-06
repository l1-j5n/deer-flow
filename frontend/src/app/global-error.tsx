"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40 }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          An unexpected error occurred.
        </p>
        <button
          onClick={() => typeof window !== "undefined" && window.location.reload()}
          style={{
            padding: "8px 16px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
