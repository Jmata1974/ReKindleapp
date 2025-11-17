export default function Home() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left column: overview cards */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Today’s nudges */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            background: "#ffffff",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Today&apos;s overview</h1>
          <p style={{ margin: "0.25rem 0 0.75rem", fontSize: "0.9rem", color: "#666" }}>
            A quick glance at the relationships that might need a little attention.
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <li>
              <strong>Mom</strong> – Weekly cadence, you&apos;re a day behind.
            </li>
            <li>
              <strong>Jess</strong> – You added a note about burnout and a jam
              night. A short text would mean a lot.
            </li>
            <li>
              <strong>Connor</strong> – Follow up on travel plans and how he&apos;s
              feeling about next steps.
            </li>
          </ul>
        </div>

        {/* Mini orbit summary */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            background: "#ffffff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Orbit health</h2>
          <p style={{ margin: "0.25rem 0 0.75rem", fontSize: "0.85rem", color: "#666" }}>
            Rough sketch of how your inner circles are doing.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.75rem",
              fontSize: "0.8rem",
            }}
          >
            <div
              style={{
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.6rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Inner orbit</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>5</div>
              <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                3 people fully up to date
              </div>
            </div>
            <div
              style={{
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.6rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Middle orbit</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>9</div>
              <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                4 due in the next 7 days
              </div>
            </div>
            <div
              style={{
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.6rem",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Outer orbit</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>14</div>
              <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                Mostly low-pressure, long-cadence folks
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right column: recent notes + quick actions */}
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            background: "#ffffff",
            fontSize: "0.85rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Recent notes</h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0.5rem 0 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            <li>
              <strong>Jess</strong> – &quot;Feels burned out at work but excited
              about music again.&quot;
            </li>
            <li>
              <strong>Mom</strong> – &quot;Follow-up appointment next Thursday, was
              nervous but sounded relieved.&quot;
            </li>
            <li>
              <strong>Connor</strong> – &quot;Wants to feel more on track without
              selling his soul to corporate.&quot;
            </li>
          </ul>
        </div>

        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            background: "#ffffff",
            fontSize: "0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Quick actions</h2>
          <button
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              background: "#f9fafb",
              textAlign: "left",
            }}
          >
            ✨ Add a note about someone you just talked to
          </button>
          <button
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              background: "#f9fafb",
              textAlign: "left",
            }}
          >
            🪐 Adjust orbits for 1–2 people
          </button>
          <button
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              background: "#f9fafb",
              textAlign: "left",
            }}
          >
            ⏰ Review today&apos;s reminders
          </button>
        </div>
      </aside>
    </div>
  );
}
