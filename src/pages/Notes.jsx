const MOCK_NOTES = [
  {
    id: 1,
    contact: "Jess Alvarez",
    orbit: "Middle",
    updated: "2 days ago",
    title: "Band + burnout",
    body: "Mentioned feeling burned out at work but excited about picking music back up. Wants to schedule a jam night soon.",
    tags: ["Bandmate", "Mental health", "Music"],
  },
  {
    id: 2,
    contact: "Mom",
    orbit: "Inner",
    updated: "5 days ago",
    title: "Doctor follow-up",
    body: "Has a follow-up appointment next Thursday. Was nervous about the last one but sounded relieved on the phone.",
    tags: ["Family", "Health"],
  },
  {
    id: 3,
    contact: "Connor",
    orbit: "Inner",
    updated: "1 week ago",
    title: "Travel + next steps",
    body: "Talked about upcoming travel and feeling unsure about long-term plans. Wants to feel more 'on track' but hates the corporate grind.",
    tags: ["Family", "Career"],
  },
];

export default function Notes() {
  const firstNote = MOCK_NOTES[0];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 2fr",
        gap: "1.5rem",
        alignItems: "stretch",
      }}
    >
      {/* Left: Notes list */}
      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #eee",
          padding: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          background: "#ffffff",
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
            <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Notes</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
              Capture the little things so future you remembers.
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
            + New note
          </button>
        </header>

        <div
          style={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
            fontSize: "0.8rem",
            color: "#4b5563",
          }}
        >
          💡 Tip: jot down feelings, tiny details, and future topics. ReKindle
          can surface them later when it&apos;s time to reconnect.
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {MOCK_NOTES.map((note) => (
            <li
              key={note.id}
              style={{
                borderRadius: "8px",
                border:
                  note.id === firstNote.id
                    ? "1px solid #111827"
                    : "1px solid #e5e7eb",
                background:
                  note.id === firstNote.id ? "#1118270a" : "#ffffff",
                padding: "0.55rem 0.7rem",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>{note.contact}</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {note.updated}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#4b5563",
                  marginBottom: "0.15rem",
                }}
              >
                {note.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.25rem",
                  marginTop: "0.15rem",
                  fontSize: "0.7rem",
                }}
              >
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      borderRadius: "999px",
                      background: "#eef2ff",
                      padding: "0.1rem 0.5rem",
                      color: "#4f46e5",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Right: Selected note detail */}
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
          fontSize: "0.9rem",
        }}
      >
        <header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.5rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginBottom: "0.1rem",
                }}
              >
                Note about
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                {firstNote.contact}
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              <div>Orbit: {firstNote.orbit}</div>
              <div>Updated: {firstNote.updated}</div>
            </div>
          </div>

          <div
            style={{
              marginTop: "0.5rem",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {firstNote.title}
          </div>
        </header>

        <article
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            lineHeight: 1.5,
          }}
        >
          {firstNote.body}
        </article>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.25rem",
            flexWrap: "wrap",
          }}
        >
          {firstNote.tags.map((tag) => (
            <span
              key={tag}
              style={{
                borderRadius: "999px",
                background: "#eef2ff",
                padding: "0.15rem 0.6rem",
                color: "#4f46e5",
                fontSize: "0.75rem",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              borderRadius: "8px",
              border: "none",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              cursor: "pointer",
              background: "#111827",
              color: "#ffffff",
            }}
          >
            Pin to reminders
          </button>
          <button
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              cursor: "pointer",
              background: "#ffffff",
            }}
          >
            Edit note
          </button>
        </div>
      </section>
    </div>
  );
}
