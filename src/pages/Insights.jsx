const INSIGHTS_SUMMARY = {
  totalContacts: 28,
  innerOrbit: 5,
  middleOrbit: 9,
  outerOrbit: 14,
  upToDate: 11,
  slightlyOverdue: 6,
  veryOverdue: 3,
};

const REACH_OUT_SUGGESTIONS = [
  {
    id: 1,
    name: "Jess Alvarez",
    orbit: "Middle",
    lastContact: "6 weeks ago",
    reason:
      "You used to talk often during band days. Recent notes suggest she’s been under stress and might appreciate a check-in.",
    suggestion: "Send a short voice note or share a song that made you think of her.",
  },
  {
    id: 2,
    name: "Old roommate (Mark)",
    orbit: "Outer",
    lastContact: "4 months ago",
    reason:
      "You marked him as someone who showed up for you in a tough season. Cadence suggests a light touch every few months.",
    suggestion: "A quick “Hey, thinking about that ridiculous apartment era” text.",
  },
  {
    id: 3,
    name: "Student you mentored",
    orbit: "Outer",
    lastContact: "3 months ago",
    reason:
      "You noted they were anxious about next steps. A tiny follow-up could have outsized impact.",
    suggestion:
      "Ask one simple question about how things are going now—low pressure, high signal.",
  },
];

export default function Insights() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 2fr",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left: Overview & stats */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* High-level summary */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "1rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            background: "#ffffff",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Insights</h1>
          <p
            style={{
              margin: "0.25rem 0 0.75rem",
              fontSize: "0.9rem",
              color: "#666",
            }}
          >
            A gentle reflection on how you&apos;re showing up for your people.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.75rem",
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.7rem",
              }}
            >
              <div
                style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.15rem" }}
              >
                Total contacts
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 600 }}>
                {INSIGHTS_SUMMARY.totalContacts}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                {INSIGHTS_SUMMARY.innerOrbit} inner · {INSIGHTS_SUMMARY.middleOrbit} middle ·{" "}
                {INSIGHTS_SUMMARY.outerOrbit} outer
              </div>
            </div>

            <div
              style={{
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "0.7rem",
              }}
            >
              <div
                style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.15rem" }}
              >
                Cadence health
              </div>
              <div style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5 }}>
                <strong>{INSIGHTS_SUMMARY.upToDate}</strong> on track ·{" "}
                <strong>{INSIGHTS_SUMMARY.slightlyOverdue}</strong> a bit overdue ·{" "}
                <strong>{INSIGHTS_SUMMARY.veryOverdue}</strong> need attention
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "#6b7280" }}>
                Focus on the small number that really matter, not perfection.
              </div>
            </div>
          </div>
        </div>

        {/* Soft reflection block */}
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
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>A quick reflection</h2>
          <p style={{ margin: "0.4rem 0 0.6rem", color: "#4b5563", lineHeight: 1.5 }}>
            If you zoom out on the past couple of weeks, which 2–3 relationships feel
            like they&apos;d give you energy if you invested just a little bit more?
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            <li>Someone you admire but haven&apos;t talked to in a while.</li>
            <li>Someone who has quietly shown up for you in the past.</li>
            <li>Someone you&apos;re worried might feel a bit forgotten.</li>
          </ul>
          <p style={{ marginTop: "0.6rem", color: "#6b7280" }}>
            You don&apos;t have to fix everything. One small check-in can be enough.
          </p>
        </div>
      </section>

      {/* Right: specific suggestions */}
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
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>People to gently revisit</h2>
        <p style={{ margin: "0.3rem 0 0.5rem", color: "#6b7280" }}>
          These aren&apos;t obligations—just people where a small touch might ripple
          bigger than you think.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {REACH_OUT_SUGGESTIONS.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                padding: "0.7rem 0.8rem",
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    Orbit: {item.orbit} · Last contact: {item.lastContact}
                  </div>
                </div>
              </div>

              <p
                style={{
                  margin: "0.4rem 0 0.35rem",
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                {item.reason}
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#111827",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                Suggested: {item.suggestion}
              </p>
            </div>
          ))}
        </div>

        <button
          style={{
            marginTop: "0.5rem",
            alignSelf: "flex-start",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "0.5rem 0.9rem",
            cursor: "pointer",
            background: "#ffffff",
          }}
        >
          🔁 Shuffle suggestions
        </button>
      </section>
    </div>
  );
}
