"use client";

import { useState } from "react";

interface Phase {
  id: number;
  agent: string;
  emoji: string;
  color: string;
  label: string;
  tagline: string;
  job: string;
  yourRole: string;
  output: string;
  checkpoints: string[];
}

interface Tool {
  name: string;
  role: string;
  use: string;
  color: string;
}

interface MindsetItem {
  label: string;
  icon: string;
  text: string;
  bg: string;
}

const phases: Phase[] = [
  {
    id: 1,
    agent: "Product Manager",
    emoji: "🧠",
    color: "#FF6B35",
    label: "STRATEGY",
    tagline: "Define WHO & WHAT",
    job: "Ask 5 sharp questions → Write a PRD",
    yourRole: "Describe your idea + answer questions",
    output: "PRD + User Flow",
    checkpoints: [
      "Who is the user?",
      "What pain do they have?",
      "What does success look like?",
      "What is NOT in scope?",
      "How will judges judge it?",
    ],
  },
  {
    id: 2,
    agent: "System Architect",
    emoji: "🏗️",
    color: "#4ECDC4",
    label: "BLUEPRINT",
    tagline: "Define HOW it's built",
    job: "Suggest Tech Stack + File Map (every file gets 1-line purpose)",
    yourRole: "Approve or reject each file decision",
    output: "Folder Structure + Tech Stack",
    checkpoints: [
      "What framework? (React, Next.js, Flask?)",
      "What DB? (Supabase, Firebase, SQLite?)",
      "What is db.py responsible for?",
      "What is auth.js responsible for?",
      "What is utils.js responsible for?",
    ],
  },
  {
    id: 3,
    agent: "Feature Developer",
    emoji: "⚙️",
    color: "#A78BFA",
    label: "BUILD",
    tagline: "Build ONE feature at a time",
    job: "Explain Logic Flow FIRST → Code second",
    yourRole: "Confirm you understand flow before code is written",
    output: "Working feature per session",
    checkpoints: [
      "Form → Validation → API → DB?",
      "Where does the data come from?",
      "Where does it go?",
      "What can break here?",
      "Why THIS file, not another?",
    ],
  },
  {
    id: 4,
    agent: "QA Debugger",
    emoji: "🔍",
    color: "#F59E0B",
    label: "HARDEN",
    tagline: "Find what breaks BEFORE judges do",
    job: "Point to which file to check + what keyword to search",
    yourRole: "Reproduce the bug → Read the error message",
    output: "Ship-ready, tested feature",
    checkpoints: [
      "Which file threw the error?",
      "What line number?",
      "What are the files miscommunicating?",
      "Does it break on mobile?",
      "Does it break with empty input?",
    ],
  },
];

const masterPrompt = `I want to develop a complete, ship-ready project for a hackathon. I am a BCA student and I want to act as the CTO. You will act as a Multi-Agent System to guide me. We will NOT write any code yet.

STEP 1 — Product Manager Agent:
Ask me 5 targeted questions about my project idea to help us write a perfect PRD (Product Requirements Document) and User Flow.

STEP 2 — System Architect Agent:
Once the PRD is done, provide a Tech Stack recommendation and a Detailed File Structure. For every file you suggest (e.g., db.py, auth.js), explain in 1 sentence exactly what its responsibility is.

STEP 3 — Logic-First Developer Agent:
When we start coding, we build ONE feature at a time. For each feature, do NOT just give me code. First, explain the Logic Flow (e.g., "Data goes from the Form → Validation Script → Database"). Only after I confirm I understand the flow, provide the code.

STEP 4 — Debugger Agent:
If I hit an error, teach me how to investigate it. Tell me which file to check first, what keywords to look for, and how the files are "miscommunicating."

Do you understand this framework? If yes, let's start with Step 1: Ask me the 5 questions for my project idea.`;

const tools: Tool[] = [
  { name: "Claude.ai", role: "Planner & Reasoner", use: "PRD, Architecture, Logic Explanation", color: "#FF6B35" },
  { name: "Cursor.com", role: "Code Editor (Composer Mode)", use: "Multi-file builds, sees your whole project", color: "#4ECDC4" },
  { name: "Vercel / Netlify", role: "Deploy in 2 min", use: "Ship to live URL for judges", color: "#A78BFA" },
  { name: "Supabase", role: "Database + Auth", use: "Instant backend, no server setup", color: "#F59E0B" },
];

const mindset: MindsetItem[] = [
  { label: "REMEMBER — The Logic", icon: "✅", text: "How data moves. Click Submit → API first or DB? This wins hackathons.", bg: "#1a2f1a" },
  { label: "IGNORE — The Syntax", icon: "🚫", text: "Don't memorize semicolons. AI handles syntax. You handle connecting dots.", bg: "#2a1a1a" },
  { label: "ALWAYS ASK — The Why", icon: "💡", text: "Every time AI gives code: 'Why put this in index.js not utils.js?'", bg: "#1a1a2f" },
];

export default function ShipItFramework() {
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("workflow");

  const copyPrompt = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8f0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #222",
        padding: "24px 32px",
        background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a0f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#FF6B35", marginBottom: "6px", textTransform: "uppercase" }}>
            ◆ The Architect's OS
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 32px)", fontWeight: "900", letterSpacing: "-1px" }}>
            Multi-Agent{" "}
            <span style={{ color: "#FF6B35" }}>Ship-It</span>{" "}
            Framework
          </h1>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Stop being a consumer → Start being a CTO
          </div>
        </div>
        <div style={{
          background: "#FF6B3520",
          border: "1px solid #FF6B3550",
          padding: "8px 16px",
          fontSize: "11px",
          color: "#FF6B35",
          letterSpacing: "2px",
        }}>
          HACKATHON READY
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", background: "#0a0a0f" }}>
        {["workflow", "prompt", "tools", "mindset"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "14px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #FF6B35" : "2px solid transparent",
              color: activeTab === tab ? "#FF6B35" : "#555",
              cursor: "pointer",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              transition: "color 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>

        {/* WORKFLOW TAB */}
        {activeTab === "workflow" && (
          <div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "28px", letterSpacing: "1px" }}>
              CLICK EACH PHASE TO SEE YOUR CHECKLIST →
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  onClick={() => setActivePhase(activePhase?.id === phase.id ? null : phase)}
                  style={{
                    border: `1px solid ${activePhase?.id === phase.id ? phase.color : "#222"}`,
                    background: activePhase?.id === phase.id ? `${phase.color}10` : "#0d0d15",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "16px",
                    fontSize: "10px",
                    color: phase.color,
                    letterSpacing: "2px",
                    fontWeight: "bold",
                  }}>
                    {String(phase.id).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{phase.emoji}</div>
                  <div style={{ fontSize: "10px", letterSpacing: "3px", color: phase.color, marginBottom: "4px" }}>
                    {phase.label}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "8px" }}>{phase.agent}</div>
                  <div style={{ fontSize: "11px", color: "#777", marginBottom: "12px", fontStyle: "italic" }}>
                    {phase.tagline}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa", lineHeight: "1.6", marginBottom: "8px" }}>
                    <span style={{ color: "#555" }}>AI: </span>{phase.job}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa", lineHeight: "1.6" }}>
                    <span style={{ color: "#555" }}>YOU: </span>{phase.yourRole}
                  </div>
                  <div style={{
                    marginTop: "12px",
                    padding: "6px 10px",
                    background: `${phase.color}20`,
                    fontSize: "10px",
                    color: phase.color,
                    letterSpacing: "1px",
                  }}>
                    OUTPUT → {phase.output}
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded Checklist */}
            {activePhase && (
              <div style={{
                marginTop: "20px",
                border: `1px solid ${activePhase.color}`,
                background: `${activePhase.color}08`,
                padding: "24px",
              }}>
                <div style={{ fontSize: "10px", letterSpacing: "3px", color: activePhase.color, marginBottom: "16px" }}>
                  {activePhase.emoji} PHASE {activePhase.id} CHECKLIST — {activePhase.agent.toUpperCase()}
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {activePhase.checkpoints.map((point, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 14px",
                      background: "#0a0a0f",
                      border: "1px solid #1a1a1a",
                      fontSize: "13px",
                      color: "#ccc",
                    }}>
                      <span style={{ color: activePhase.color, fontWeight: "bold", minWidth: "20px" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flow diagram */}
            <div style={{ marginTop: "32px", padding: "20px", border: "1px solid #1a1a1a", background: "#0d0d15" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "16px" }}>DATA FLOW MENTAL MODEL</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {["User Action", "Form Validation", "API Route", "Business Logic", "Database", "Response"].map((step, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      padding: "8px 14px",
                      background: "#1a1a2a",
                      border: "1px solid #333",
                      fontSize: "12px",
                      color: "#ccc",
                      whiteSpace: "nowrap",
                    }}>
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <span style={{ color: "#FF6B35", fontSize: "16px" }}>→</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "12px", fontStyle: "italic" }}>
                ↑ This is what you MUST understand at every feature. Not the syntax — the flow.
              </div>
            </div>
          </div>
        )}

        {/* PROMPT TAB */}
        {activeTab === "prompt" && (
          <div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "24px", letterSpacing: "1px" }}>
              COPY THIS EXACT PROMPT → PASTE INTO CLAUDE.AI OR GPT-4o TO START ANY PROJECT
            </div>

            <div style={{ border: "1px solid #333", background: "#0d0d15" }}>
              <div style={{
                padding: "12px 20px",
                borderBottom: "1px solid #1a1a1a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "11px", color: "#555", letterSpacing: "2px" }}>MASTER ARCHITECT PROMPT</span>
                <button
                  onClick={copyPrompt}
                  style={{
                    padding: "8px 20px",
                    background: copied ? "#1a3a1a" : "#FF6B3520",
                    border: `1px solid ${copied ? "#4ECDC4" : "#FF6B35"}`,
                    color: copied ? "#4ECDC4" : "#FF6B35",
                    cursor: "pointer",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontFamily: "'Courier New', monospace",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ COPIED!" : "COPY PROMPT"}
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                {[
                  { step: "STEP 1 — Product Manager Agent", color: "#FF6B35", text: "Ask me 5 targeted questions about my project idea to help us write a perfect PRD (Product Requirements Document) and User Flow." },
                  { step: "STEP 2 — System Architect Agent", color: "#4ECDC4", text: "Once the PRD is done, provide a Tech Stack recommendation and a Detailed File Structure. For every file you suggest (e.g., db.py, auth.js), explain in 1 sentence exactly what its responsibility is." },
                  { step: "STEP 3 — Logic-First Developer Agent", color: "#A78BFA", text: "When we start coding, we build ONE feature at a time. For each feature, do NOT just give me code. First, explain the Logic Flow. Only after I confirm I understand, provide the code." },
                  { step: "STEP 4 — Debugger Agent", color: "#F59E0B", text: "If I hit an error, teach me to investigate. Tell me which file to check first, what keywords to look for, and how the files are miscommunicating." },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "3px", color: s.color, marginBottom: "8px" }}>{s.step}</div>
                    <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.7", paddingLeft: "16px", borderLeft: `2px solid ${s.color}40` }}>
                      {s.text}
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#1a1a0a",
                  border: "1px solid #FF6B3530",
                  fontSize: "13px",
                  color: "#FF6B35",
                  fontWeight: "bold",
                }}>
                  "Do you understand this framework? If yes, let's start with Step 1: Ask me the 5 questions for my project idea."
                </div>
              </div>
            </div>

            <div style={{ marginTop: "20px", padding: "16px", border: "1px solid #1a1a1a", fontSize: "12px", color: "#666", lineHeight: "1.8" }}>
              <span style={{ color: "#4ECDC4" }}>PRO TIP:</span> Save this prompt in Notion or Notes. Start EVERY new project with this. It forces you to understand the "why" before the AI writes a single line of code.
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === "tools" && (
          <div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "24px", letterSpacing: "1px" }}>
              YOUR FULL STACK TOOLKIT — WHAT EACH TOOL DOES IN THE WORKFLOW
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {tools.map((tool, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 1fr",
                  gap: "0",
                  border: "1px solid #222",
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "20px",
                    background: `${tool.color}15`,
                    borderRight: `1px solid ${tool.color}30`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: tool.color }}>{tool.name}</div>
                  </div>
                  <div style={{ padding: "20px", borderRight: "1px solid #1a1a1a" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", marginBottom: "6px" }}>ROLE</div>
                    <div style={{ fontSize: "13px", color: "#ccc" }}>{tool.role}</div>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", marginBottom: "6px" }}>WHEN TO USE</div>
                    <div style={{ fontSize: "13px", color: "#ccc" }}>{tool.use}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "32px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "16px" }}>DEPLOYMENT WORKFLOW</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  ["01", "Build locally with Cursor (Composer mode sees all files)"],
                  ["02", "Push to GitHub (git add, commit, push)"],
                  ["03", "Connect repo to Vercel → auto-deploys on every push"],
                  ["04", "Share live URL with hackathon judges in <5 min"],
                ].map(([num, text]) => (
                  <div key={num} style={{ display: "flex", gap: "16px", alignItems: "center", padding: "12px 16px", background: "#0d0d15", border: "1px solid #1a1a1a" }}>
                    <span style={{ color: "#FF6B35", fontWeight: "bold", minWidth: "24px" }}>{num}</span>
                    <span style={{ fontSize: "13px", color: "#bbb" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MINDSET TAB */}
        {activeTab === "mindset" && (
          <div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "24px", letterSpacing: "1px" }}>
              THE CTO MINDSET — WHAT SEPARATES WINNERS FROM CODERS
            </div>

            <div style={{ display: "grid", gap: "16px", marginBottom: "32px" }}>
              {mindset.map((item, i) => (
                <div key={i} style={{
                  padding: "24px",
                  background: item.bg,
                  border: "1px solid #222",
                }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "24px" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "bold", color: "#e8e8f0", marginBottom: "8px", letterSpacing: "1px" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "14px", color: "#aaa", lineHeight: "1.7" }}>{item.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "24px", border: "1px solid #333", background: "#0d0d15" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#A78BFA", marginBottom: "16px" }}>THE ONLY QUESTION THAT MATTERS</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", lineHeight: "1.5", color: "#e8e8f0" }}>
                "If I delete this file, what breaks and why?"
              </div>
              <div style={{ fontSize: "13px", color: "#666", marginTop: "12px" }}>
                If you can answer that for every file in your project → you are ready to ship. You are no longer a user of AI. You are a builder.
              </div>
            </div>

            <div style={{ marginTop: "20px", padding: "16px", background: "#FF6B3510", border: "1px solid #FF6B3530" }}>
              <div style={{ fontSize: "11px", color: "#FF6B35", letterSpacing: "2px", marginBottom: "8px" }}>YOUR ROLE AS CTO</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {["Approve the architecture", "Ask 'why' for every decision", "Know the data flow", "Connect the agents", "Own the output"].map((r, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#ccc", padding: "8px", background: "#0a0a0f", border: "1px solid #1a1a1a" }}>
                    ◆ {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
