export default function Profile() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 2fr",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left: Your profile */}
      <section
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
        <header>
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Profile</h1>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            Tune how ReKindle feels and how it shows up in your life.
          </p>
        </header>

        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "999px",
              background: "#111827",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            JM
          </div>
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ fontWeight: 600 }}>Jeremy Matamales</div>
            <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              jskarma74@gmail.com
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              Timezone: America/Los_Angeles
            </div>
          </div>
        </div>

        <hr style={{ margin: "0.85rem 0" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Daily nudge window
            </div>
            <div style={{ fontWeight: 500 }}>6:00 pm – 9:00 pm</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              ReKindle will try to surface reminders when you&apos;re most likely
              to have a few minutes free.
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Default cadence style
            </div>
            <div style={{ fontWeight: 500 }}>Gentle but intentional</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Prioritize a small set of meaningful relationships over a huge contact list.
            </div>
          </div>
        </div>
      </section>

      {/* Right: Preferences & app behavior */}
      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #eee",
          padding: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          background: "#ffffff",
          fontSize: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Preferences</h2>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input type="checkbox" defaultChecked />
          Email digest with weekly summary of nudges & highlights
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input type="checkbox" defaultChecked />
          Prefer gentle language for reminders
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input type="checkbox" />
          Surface “stretch” relationships (people slightly outside your comfort zone)
        </label>

        <hr style={{ margin: "0.85rem 0" }} />

        <div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Privacy stance</div>
          <p
            style={{
              margin: "0.3rem 0 0.4rem",
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            ReKindle is designed as a private reflection tool first. Data stays tied
            to your account and is meant to support how you show up—not become
            another feed.
          </p>
        </div>

        <div
          style={{
            marginTop: "0.25rem",
            padding: "0.6rem 0.8rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>Backup & export</strong>
          <p
            style={{
              margin: "0.3rem 0 0.4rem",
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            In a future version, you&apos;ll be able to export your notes and
            relationship data or back them up to your own storage.
          </p>
          <button
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "0.45rem 0.9rem",
              cursor: "pointer",
              background: "#ffffff",
              fontSize: "0.8rem",
            }}
          >
            ⚙️ View backup & export options
          </button>
        </div>
      </section>
    </div>
  );
}
