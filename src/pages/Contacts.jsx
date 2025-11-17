const MOCK_CONTACTS = [
  {
    id: 1,
    name: "Mom",
    orbit: "Inner",
    lastContact: "8 days ago",
    tags: ["Family"],
  },
  {
    id: 2,
    name: "Jess Alvarez",
    orbit: "Middle",
    lastContact: "3 weeks ago",
    tags: ["Bandmate", "Creative"],
  },
  {
    id: 3,
    name: "Connor",
    orbit: "Inner",
    lastContact: "11 days ago",
    tags: ["Family"],
  },
  {
    id: 4,
    name: "Lennon (Ethan)",
    orbit: "Inner",
    lastContact: "2 days ago",
    tags: ["Family"],
  },
  {
    id: 5,
    name: "Sofia",
    orbit: "Inner",
    lastContact: "Today",
    tags: ["Partner"],
  },
];

export default function Contacts() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left: Contact list */}
      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #eee",
          padding: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          background: "#ffffff",
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
            <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Contacts</h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
              Everyone in your orbit, in one place.
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

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", color: "#6b7280" }}>
              <th style={{ padding: "0.4rem" }}>Name</th>
              <th style={{ padding: "0.4rem" }}>Orbit</th>
              <th style={{ padding: "0.4rem" }}>Last contact</th>
              <th style={{ padding: "0.4rem" }}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTACTS.map((c, index) => (
              <tr
                key={c.id}
                style={{
                  background: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                }}
              >
                <td style={{ padding: "0.5rem" }}>{c.name}</td>
                <td style={{ padding: "0.5rem" }}>{c.orbit}</td>
                <td style={{ padding: "0.5rem" }}>{c.lastContact}</td>
                <td style={{ padding: "0.5rem", color: "#4b5563" }}>
                  {c.tags.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Right: Import / quick actions */}
      <aside
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
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Import & organize</h2>
        <p style={{ margin: 0, color: "#555" }}>
          ReKindle can pull contacts from your phone, Google, or a CSV, then help
          you sort them into orbits.
        </p>

        <button
          style={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "0.6rem 0.9rem",
            cursor: "pointer",
            background: "#f9fafb",
            textAlign: "left",
          }}
        >
          📱 Import from phone / Google
        </button>

        <button
          style={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "0.6rem 0.9rem",
            cursor: "pointer",
            background: "#f9fafb",
            textAlign: "left",
          }}
        >
          📄 Upload CSV / spreadsheet
        </button>

        <hr style={{ margin: "0.75rem 0" }} />

        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>Pro tip</strong>
          <p style={{ margin: "0.4rem 0 0", color: "#4b5563" }}>
            Start with 15–25 people you genuinely care about. You can always add
            more later, but ReKindle works best when your orbits feel intentional,
            not overwhelming.
          </p>
        </div>
      </aside>
    </div>
  );
}
