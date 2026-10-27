"use client";

// Shown when the root layout itself fails (it loads the profile and inbox count).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 18 }}>CountIQ couldn&apos;t load</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>We couldn&apos;t reach the database. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 8, padding: "8px 14px", borderRadius: 8, border: 0, background: "#5b67f1", color: "white" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
