"use client";

import { useState } from "react";

const FONT = `'IBM Plex Mono', monospace`;

const LAYERS = [
  {
    id: "architecture",
    label: "ARCHITECTURE",
    icon: "◈",
    color: "#00FFB2",
    tagline: "Know what you're building before you build it",
    description: "Most vibe-coded projects die here. Files do 5 things each, nothing is traceable, and changing one line breaks three others. Architecture is not optional — it's the skeleton.",
    concepts: [
      {
        term: "Single Responsibility",
        plain: "Every file does exactly ONE thing",
        why: "If a file handles both API calls AND rendering UI, when something breaks you don't know which half is the problem.",
        example: "BAD: userPage.jsx (fetches user + shows profile + handles auth)\nGOOD: useUser.js (fetch only) + UserProfile.jsx (display only) + useAuth.js (auth only)",
        signal: "Can you explain this file's job in 1 sentence? If not → split it."
      },
      {
        term: "Dependency Direction",
        plain: "Data flows ONE way: top → bottom, never circular",
        why: "Circular dependencies (A needs B, B needs A) cause infinite loops, hard crashes, and impossible debugging.",
        example: "GOOD: App → Page → Component → Hook → API\nBAD: Hook → Component → Hook (circular)",
        signal: "Draw your file connections. Any arrows that loop back = danger zone."
      },
      {
        term: "Layer Separation",
        plain: "UI, Logic, and Data are 3 different layers — never mix them",
        why: "When your database changes, you shouldn't have to touch your UI code. Mixing layers creates a tangled mess where nothing is reusable.",
        example: "Layer 1 (UI): React components — just display\nLayer 2 (Logic): Hooks, helpers — just process\nLayer 3 (Data): API calls, DB — just fetch/save",
        signal: "Is there a SQL query inside a React component? That's layers 1 and 3 directly touching. Fix it."
      },
      {
        term: "File Map",
        plain: "Before writing code, write a diagram of every file and its connections",
        why: "AI writes code for the current context. It doesn't know about the 12 other files. Your file map is the shared memory.",
        example: "index.jsx → imports App.jsx\nApp.jsx → imports useAuth, Dashboard\nuseAuth.js → calls /api/auth\nDashboard.jsx → imports useData, Charts",
        signal: "Paste your file map as a comment at the top of your entry file. AI will use it. You will use it when debugging."
      },
    ]
  },
  {
    id: "resilience",
    label: "RESILIENCE",
    icon: "◉",
    color: "#FF6B35",
    tagline: "Users will break your app. Build for that.",
    description: "Your app works perfectly when YOU use it. Real users spam buttons, submit empty forms, paste 10,000 characters where you expected 20, and hit your app from a 2G connection. Plan for chaos.",
    concepts: [
      {
        term: "Input Validation",
        plain: "Every input the user can touch must be validated — on the frontend AND the backend",
        why: "Frontend validation is UX. Backend validation is security. You need both. A user can bypass any frontend check with DevTools.",
        example: "Frontend: Disable submit if email field is empty (instant feedback)\nBackend: Always re-check: is this actually an email? Is it < 255 chars? Does this user have permission?",
        signal: "For every form field: What's the min length? Max length? What characters are allowed? What happens if it's empty?"
      },
      {
        term: "Edge Cases",
        plain: "The unhappy path is more common than the happy path",
        why: "You build for the ideal flow. Users live in the broken flow. Empty states, network errors, duplicate submissions — these all need explicit handling.",
        example: "Empty state: User has no data yet → show a message, not a blank page\nDuplicate: User clicks submit twice → only one request fires\nTimeout: API takes 10s → show a loader, then a timeout message",
        signal: "For every feature, ask: What if it fails? What if it's empty? What if the user does it twice?"
      },
      {
        term: "Error Boundaries",
        plain: "Crashes in one part of the app should never crash the whole app",
        why: "Without error boundaries, one broken component white-screens the entire app. Users see nothing and leave forever.",
        example: "Wrap risky components: <ErrorBoundary fallback={<p>Something went wrong</p>}>\n  <DataChart />\n</ErrorBoundary>",
        signal: "Any component that fetches data or renders dynamic content should be wrapped in an error boundary."
      },
      {
        term: "Loading & Empty States",
        plain: "Every async operation needs 3 states: loading, success, and error",
        why: "A blank screen while data loads feels broken. Users will refresh, which creates more requests, which can cascade.",
        example: "const { data, isLoading, error } = useQuery(...)\nif (isLoading) return <Spinner />\nif (error) return <ErrorMessage />\nif (!data.length) return <EmptyState />\nreturn <DataList data={data} />",
        signal: "Remove every instance of 'if (!data) return null' and replace with explicit states."
      },
    ]
  },
  {
    id: "scale",
    label: "SCALABILITY",
    icon: "◎",
    color: "#A78BFA",
    tagline: "Built for 10 users today. Ready for 10,000 tomorrow.",
    description: "Scalability isn't just about servers. It's about whether your code, your database, and your API design can handle growth without being rewritten from scratch.",
    concepts: [
      {
        term: "API Rate Limits",
        plain: "Every external API has limits. You will hit them. Plan for it now.",
        why: "OpenAI, Supabase, Stripe — they all have rate limits. When you hit them with no handling, your app crashes silently or throws cryptic errors.",
        example: "Implement exponential backoff:\n1st retry: wait 1s\n2nd retry: wait 2s\n3rd retry: wait 4s\nAfter 3 fails: show user a clear error, don't keep hammering the API",
        signal: "Every API call should have a retry wrapper. Zero retries = zero resilience."
      },
      {
        term: "Database Indexes",
        plain: "Queries that work at 100 rows will crawl at 100,000 rows without indexes",
        why: "A query that scans every row in a table gets slower as data grows. Indexes let the database jump directly to the right rows.",
        example: "If you query users by email: CREATE INDEX idx_users_email ON users(email);\nIf you filter by user_id + created_at: CREATE INDEX idx_posts_user_date ON posts(user_id, created_at);",
        signal: "Every column you filter by in a WHERE clause or JOIN should have an index."
      },
      {
        term: "Pagination",
        plain: "Never return ALL data at once. Always paginate.",
        why: "Returning 10,000 rows to display 10 of them is a performance disaster. It kills your database, bloats your network response, and freezes the browser.",
        example: "BAD: SELECT * FROM posts\nGOOD: SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 0\nThen pass ?page=2 for next 20",
        signal: "Any list in your UI that could theoretically grow past 50 items needs pagination."
      },
      {
        term: "Caching",
        plain: "Don't re-fetch data that hasn't changed",
        why: "Hitting your database or API on every page render wastes money, increases latency, and hits rate limits faster.",
        example: "React Query does this automatically: staleTime: 60 * 1000 means data stays fresh for 1 minute — no re-fetch.\nFor heavy data: cache at the API level with Redis or Vercel Edge Cache.",
        signal: "If users see the same data on every page load, you should be caching it — not re-fetching."
      },
    ]
  },
  {
    id: "mvp",
    label: "MVP vs PRODUCT",
    icon: "◑",
    color: "#F59E0B",
    tagline: "A demo and a product are fundamentally different things",
    description: "Tools like Trickle, Motionsites, and one-night vibe sessions give you a demo. That's valuable for validation. But demos are not products. Here's exactly what separates them.",
    concepts: [
      {
        term: "What an MVP Actually Is",
        plain: "The minimum set of features that lets a REAL user solve a REAL problem",
        why: "Not minimum as in 'as few features as possible.' Minimum as in 'no unnecessary features.' An MVP still needs auth, error handling, and real data. It just doesn't need a settings page.",
        example: "NOT an MVP: A landing page with fake data and no real functionality\nNOT an MVP: A fully featured app with 20 features\nACTUAL MVP: Auth + 1 core feature that actually works end-to-end with real users",
        signal: "Can a stranger sign up, use the core feature, and get real value — without you helping them? That's an MVP."
      },
      {
        term: "Demo vs. Production Checklist",
        plain: "5 specific things that make the difference",
        why: "This is the exact gap between 'looks impressive in a pitch' and 'survives actual users'.",
        example: "DEMO HAS: Working happy path, fake/seeded data, no auth or basic auth, no error states, works on your machine\nPRODUCTION HAS: Input validation everywhere, real error messages, rate limiting, monitoring/logs, works on any device/connection",
        signal: "Run through the demo with: empty inputs, bad data, no internet, two tabs open at once. If anything breaks → not production."
      },
      {
        term: "When to Use No-Code Tools",
        plain: "Use Trickle / Motionsites for validation. Not for your production stack.",
        why: "No-code tools are fast for proving an idea. But they lock you into their infrastructure, have hard limits on customization, and can't be migrated without a rewrite.",
        example: "USE for: Landing pages, marketing sites, simple internal tools, early user feedback\nDON'T USE for: Core product logic, anything with complex business rules, anything you'll need to own long-term",
        signal: "If you're thinking 'I'll just add this feature later in the real version' — you're building a demo, not an MVP."
      },
      {
        term: "The Rewrite Trap",
        plain: "Building fast now almost always means rewriting later — unless you plan for it",
        why: "Shortcuts in architecture compound. One shortcut leads to another. After 3 months, the codebase is so tangled that adding a new feature means rewriting half the app.",
        example: "The fix isn't to never move fast. It's to:\n1. Document every shortcut you take (// TODO: add validation here)\n2. Set a rule: every 2 features built, 1 cleanup session\n3. Never let tech debt stay undocumented",
        signal: "If you're afraid to touch a part of your own codebase — that's unmanaged tech debt."
      },
    ]
  },
  {
    id: "monitoring",
    label: "OBSERVABILITY",
    icon: "◐",
    color: "#EC4899",
    tagline: "If you can't see it breaking, you can't fix it",
    description: "Your app will fail in ways you never predicted, at times you're not watching. Observability means you find out before your users do — and you have the data to actually fix it.",
    concepts: [
      {
        term: "Logging",
        plain: "Record what your app does, especially when things go wrong",
        why: "Without logs, when a user reports 'it just stopped working' you have zero information. With logs, you can trace exactly what happened.",
        example: "console.log is NOT enough for production.\nUse: Vercel Logs (free), Sentry (free tier) for errors, Logtail for structured logs\nLog: every API call, every error, every auth event",
        signal: "Can you answer 'what happened to User X at 2pm yesterday' without guessing? If no → you need better logging."
      },
      {
        term: "Error Tracking",
        plain: "Get alerted when users hit errors — before they tell you",
        why: "Users don't file bug reports. They silently churn. Error tracking tools catch crashes automatically and show you the exact stack trace.",
        example: "Sentry setup in 5 minutes:\nnpm install @sentry/nextjs\nSentry.init({ dsn: 'your-dsn' })\nNow every unhandled error emails you with the full trace.",
        signal: "If your first signal of a bug is a user complaint — you have no error tracking."
      },
      {
        term: "Health Checks",
        plain: "A simple endpoint that tells you if your app is alive",
        why: "Before users hit your app, you should know if it's working. Health checks let monitoring services ping you if things go down.",
        example: "Add a route: GET /api/health\nReturns: { status: 'ok', timestamp: Date.now(), db: 'connected' }\nThen use UptimeRobot (free) to ping it every 5 minutes.",
        signal: "Does your app have a /health endpoint? If not, add it today — it takes 10 minutes."
      },
      {
        term: "Performance Baselines",
        plain: "Measure speed now so you know when it degrades",
        why: "Performance doesn't suddenly collapse — it degrades slowly. If you never measured it, you won't notice until users complain.",
        example: "Vercel Analytics (free): measures page load time per route\nTarget baselines: First Contentful Paint < 1.5s, API response < 200ms\nSet an alert if anything crosses your baseline.",
        signal: "What is your average API response time right now? If you don't know the number — you can't track it."
      },
    ]
  },
];

const PRODUCTION_CHECKLIST = [
  { category: "Architecture", items: ["Every file has a single, nameable job", "No circular dependencies between files", "UI, Logic, and Data are in separate layers", "File map exists and is up to date"] },
  { category: "Resilience", items: ["All inputs validated on frontend AND backend", "Every async call has loading, error, and empty states", "Error boundaries wrap risky components", "Duplicate submission is prevented"] },
  { category: "Scalability", items: ["All external API calls have retry logic", "Database queries on filtered columns have indexes", "All lists are paginated", "Frequently-read data is cached"] },
  { category: "Observability", items: ["Error tracking (Sentry or equivalent) is active", "Health check endpoint exists at /api/health", "All API errors are logged with context", "Uptime monitoring is configured"] },
  { category: "MVP Gate", items: ["A stranger can sign up and use core feature unaided", "App works on mobile and slow connections", "All edge cases tested: empty, max, invalid input", "Tech debt is documented (not hidden)"] },
];

export default function ProductionOS() {
  const [activeLayer, setActiveLayer] = useState("architecture");
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("layers");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const layer = LAYERS.find(l => l.id === activeLayer)!;

  const toggleCheck = (cat: string, item: string) => {
    const key = `${cat}::${item}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = PRODUCTION_CHECKLIST.reduce((acc, c) => acc + c.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  const baseStyle = {
    fontFamily: FONT,
    background: "#080810",
    minHeight: "100vh",
    color: "#c8c8d8",
    padding: "0",
    margin: "0",
  };

  return (
    <div style={baseStyle}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a2e",
        padding: "20px 24px 16px",
        background: "#0a0a14",
      }}>
        <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#444", marginBottom: "6px" }}>
          PRODUCTION READINESS FRAMEWORK v1.0
        </div>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#e8e8f8", letterSpacing: "-0.5px" }}>
          Demo → Product
        </div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
          What separates a fragile script from a system that survives real users
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginTop: "20px", borderBottom: "1px solid #1a1a2e" }}>
          {[
            { id: "layers", label: "FRAMEWORK" },
            { id: "checklist", label: "CHECKLIST" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #00FFB2" : "2px solid transparent",
              color: activeTab === tab.id ? "#00FFB2" : "#444",
              cursor: "pointer",
              fontSize: "10px",
              letterSpacing: "2px",
              fontFamily: FONT,
              marginBottom: "-1px",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FRAMEWORK TAB */}
      {activeTab === "layers" && (
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", minHeight: "calc(100vh - 130px)" }}>
          {/* Sidebar */}
          <div style={{ borderRight: "1px solid #1a1a2e", background: "#090912", padding: "16px 0" }}>
            {LAYERS.map(l => (
              <button key={l.id} onClick={() => { setActiveLayer(l.id); setExpandedConcept(null); }} style={{
                width: "100%",
                padding: "12px 16px",
                background: activeLayer === l.id ? `${l.color}10` : "none",
                border: "none",
                borderLeft: activeLayer === l.id ? `2px solid ${l.color}` : "2px solid transparent",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: FONT,
              }}>
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>{l.icon}</div>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: activeLayer === l.id ? l.color : "#444" }}>
                  {l.label}
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "24px", overflowY: "auto" }}>
            {/* Layer header */}
            <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #1a1a2e" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px", color: layer.color }}>{layer.icon}</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: layer.color }}>{layer.label}</span>
              </div>
              <div style={{ fontSize: "13px", color: "#888", fontStyle: "italic", marginBottom: "8px" }}>{layer.tagline}</div>
              <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.8 }}>{layer.description}</div>
            </div>

            {/* Concepts */}
            <div style={{ display: "grid", gap: "10px" }}>
              {layer.concepts.map((c, i) => (
                <div key={i} style={{
                  border: `1px solid ${expandedConcept === i ? layer.color + "50" : "#1a1a2e"}`,
                  background: expandedConcept === i ? `${layer.color}06` : "#0d0d18",
                  transition: "all 0.15s",
                }}>
                  <div onClick={() => setExpandedConcept(expandedConcept === i ? null : i)} style={{
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}>
                    <span style={{ fontSize: "9px", color: layer.color, minWidth: "20px" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#e2e2ee", marginBottom: "2px" }}>{c.term}</div>
                      <div style={{ fontSize: "11px", color: "#666" }}>{c.plain}</div>
                    </div>
                    <span style={{ color: layer.color, fontSize: "12px" }}>{expandedConcept === i ? "▲" : "▼"}</span>
                  </div>

                  {expandedConcept === i && (
                    <div style={{ borderTop: `1px solid ${layer.color}20`, padding: "16px" }}>
                      {/* Why */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "9px", letterSpacing: "2px", color: layer.color, marginBottom: "6px" }}>WHY IT MATTERS</div>
                        <div style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.8 }}>{c.why}</div>
                      </div>
                      {/* Example */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "9px", letterSpacing: "2px", color: layer.color, marginBottom: "6px" }}>EXAMPLE</div>
                        <pre style={{
                          fontSize: "11px", color: "#999", background: "#060610",
                          padding: "12px", margin: 0, lineHeight: 1.7,
                          border: "1px solid #1a1a2e", whiteSpace: "pre-wrap", wordBreak: "break-word"
                        }}>{c.example}</pre>
                      </div>
                      {/* Signal */}
                      <div style={{
                        padding: "10px 14px", background: `${layer.color}08`,
                        border: `1px solid ${layer.color}30`,
                        fontSize: "11px", color: layer.color, lineHeight: 1.7
                      }}>
                        ⚡ {c.signal}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST TAB */}
      {activeTab === "checklist" && (
        <div style={{ padding: "24px" }}>
          {/* Progress */}
          <div style={{ marginBottom: "24px", padding: "16px 20px", background: "#0d0d18", border: "1px solid #1a1a2e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555" }}>PRODUCTION READINESS</div>
              <div style={{ fontSize: "13px", color: checkedCount === totalItems ? "#00FFB2" : "#888" }}>
                {checkedCount}/{totalItems} {checkedCount === totalItems ? "✓ SHIP IT" : ""}
              </div>
            </div>
            <div style={{ background: "#1a1a2e", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: progress === 100 ? "#00FFB2" : progress > 60 ? "#F59E0B" : "#FF6B35",
                transition: "width 0.3s ease",
              }} />
            </div>
            <div style={{ fontSize: "10px", color: "#333", marginTop: "6px" }}>
              {progress < 40 ? "Demo territory — do not ship to real users yet" :
               progress < 80 ? "Getting there — a few critical gaps remain" :
               progress < 100 ? "Almost production-ready — close the final gaps" :
               "Production ready — you've built something real"}
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: "grid", gap: "16px" }}>
            {PRODUCTION_CHECKLIST.map((cat) => {
              const catLayer = LAYERS.find(l => l.label.startsWith(cat.category.toUpperCase().split(" ")[0])) || LAYERS[0];
              const catColor = catLayer?.color || "#00FFB2";
              const catChecked = cat.items.filter(item => checkedItems[`${cat.category}::${item}`]).length;

              return (
                <div key={cat.category} style={{ border: "1px solid #1a1a2e", background: "#0d0d18" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "3px", color: catColor }}>{cat.category.toUpperCase()}</span>
                    <span style={{ fontSize: "10px", color: catChecked === cat.items.length ? catColor : "#444" }}>
                      {catChecked}/{cat.items.length}
                    </span>
                  </div>
                  <div style={{ padding: "8px 0" }}>
                    {cat.items.map((item) => {
                      const key = `${cat.category}::${item}`;
                      const checked = checkedItems[key];
                      return (
                        <div key={item} onClick={() => toggleCheck(cat.category, item)} style={{
                          padding: "10px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          background: checked ? `${catColor}06` : "none",
                          transition: "background 0.15s",
                        }}>
                          <div style={{
                            width: "14px", height: "14px", minWidth: "14px",
                            border: `1px solid ${checked ? catColor : "#333"}`,
                            background: checked ? catColor : "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginTop: "1px",
                          }}>
                            {checked && <span style={{ fontSize: "9px", color: "#080810", fontWeight: "bold" }}>✓</span>}
                          </div>
                          <span style={{ fontSize: "12px", color: checked ? "#666" : "#aaa", lineHeight: 1.6, textDecoration: checked ? "line-through" : "none" }}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <div style={{ marginTop: "20px", padding: "14px 16px", border: "1px solid #1a1a2e", fontSize: "11px", color: "#444", lineHeight: 1.8 }}>
            <span style={{ color: "#FF6B35" }}>RULE:</span> Don't ship until you can honestly check off every item in Architecture, Resilience, and Observability. Scalability items can come after first real users — but document that you'll do them.
          </div>
        </div>
      )}
    </div>
  );
}
