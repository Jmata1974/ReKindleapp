export default function Orbit() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "1.5rem",
        alignItems: "stretch",
      }}
    >
      {/* Left: Orbit map */}
      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #eee",
          padding: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          background: "radial-gradient(circle at top, #f7fbff, #ffffff)",
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Orbit</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
              Your relationship map at a glance.
            </p>
          </div>
          <button
            style={{
              borderRadius: "999px",
              border: "none",
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              cursor: "pointer",
              background: "#111827",
              color: "#ffffff",
            }}
          >
            + Add contact
          </button>
        </header>

        {/* Fake orbit canvas */}
        <div
          style={{
            flex: 1,
            borderRadius: "999px",
            border: "1px dashed #cbd5f5",
            position: "relative",
            background:
              "radial-gradient(circle at center, #fefce8 0, #e5f0ff 40%, #f9fafb 100%)",
            overflow: "hidden",
          }}
        >
          {/* Center node */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80px",
              height: "80px",
              borderRadius: "999px",
              background: "#111827",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            You
          </div>

          {/* A few sample orbit contacts */}
          {[
            { label: "Family", top: "18%", left: "65%" },
            { label: "Friends", top: "72%", left: "30%" },
            { label: "Work", top: "28%", left: "20%" },
            { label: "Old pals", top: "70%", left: "70%" },
          ].map((node) => (
            <div
              key={node.label}
              style={{
                position: "absolute",
                top: node.top,
                left: node.left,
                transform: "translate(-50%, -50%)",
                padding: "0.3rem 0.7rem",
                borderRadius: "999px",
                background: "#ffffff",
                fontSize: "0.75rem",
                boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
      </section>

      {/* Right: Sidebar */}
      <aside
        style={{
          borderRadius: "12px",
          border: "1px solid #eee",
          padding: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Today&apos;s focus</h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
          These are the people it would mean a lot to reconnect with this week.
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0.5rem 0 0",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          <li>
            <strong>Mom</strong> – It&apos;s been 8 days since your last call.
          </li>
          <li>
            <strong>Jess (old bandmate)</strong> – You saved a draft note about
            checking in on her new job.
          </li>
          <li>
            <strong>Connor</strong> – You pinned a reminder to ask about travel
            plans.
          </li>
        </ul>

        <button
          style={{
            marginTop: "auto",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "0.6rem 0.9rem",
            fontSize: "0.85rem",
            cursor: "pointer",
            background: "#f9fafb",
            textAlign: "left",
          }}
        >
          ⚙️ Customize orbits & reminders
        </button>
      </aside>
    </div>
  );
}
