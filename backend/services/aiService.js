// backend/services/aiService.js
// Centralized AI Service for Gemini LLM calls with safe fallback

const getApiKey = () => {
  return process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
};

/**
 * Generates content using Gemini API or fallback intelligent engine
 */
const generateContent = async ({ prompt, systemInstruction = "" }) => {
  const apiKey = getApiKey();

  if (apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key_here") {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [];
      if (systemInstruction) {
        contents.push({
          role: "user",
          parts: [{ text: `[System Instruction]: ${systemInstruction}\n\nUser Request: ${prompt}` }]
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        console.warn("Gemini API call returned status:", response.status);
      }
    } catch (err) {
      console.error("Gemini API call failed, using intelligent engine fallback:", err.message);
    }
  }

  // Intelligent fallback responses if key is missing or offline
  return generateFallbackResponse(prompt);
};

/**
 * Intelligent structured task generator for Planner Agent
 */
const generateTasksFromRequirements = async (projectTitle, projectDesc, requirements) => {
  const apiKey = getApiKey();

  const prompt = `Given the software project title "${projectTitle}", description "${projectDesc}", and requirements: "${requirements || projectDesc}", generate 6 to 8 technical tasks for multi-agent development.
Return ONLY valid JSON array of objects with keys: "title", "description", "assignedAgent" (choose from: "Planner Agent", "Requirements Agent", "Architecture Agent", "Database Agent", "Backend Agent", "Frontend Agent", "Tester Agent", "Reviewer Agent", "Documentation Agent", "PM Agent"), "priority" ("Low", "Medium", "High", "Critical"), "status" ("Todo", "Backlog").`;

  if (apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key_here") {
    try {
      const resText = await generateContent({ prompt });
      // Clean JSON formatting fence if present
      const cleaned = resText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn("Could not parse AI JSON output, using structured task generator:", e.message);
    }
  }

  // Fallback structured task generation based on project requirements
  const reqText = requirements || projectDesc || "Software application";
  return [
    {
      title: "System Architecture & Spec Breakdown",
      description: `Analyze core requirements for ${projectTitle}: "${reqText.slice(0, 80)}..." and establish overall system design.`,
      assignedAgent: "Architecture Agent",
      priority: "High",
      status: "Todo",
    },
    {
      title: "Database Schema Design & Migration",
      description: `Define data models, relationships, indexes, and persistence strategy for ${projectTitle}.`,
      assignedAgent: "Database Agent",
      priority: "High",
      status: "Todo",
    },
    {
      title: "Core Backend API Implementation",
      description: `Build RESTful endpoints, authentication middleware, and business logic for ${projectTitle}.`,
      assignedAgent: "Backend Agent",
      priority: "Critical",
      status: "Todo",
    },
    {
      title: "Frontend UI Component Library & Routing",
      description: "Develop responsive user interface, integrate state management, and build primary views.",
      assignedAgent: "Frontend Agent",
      priority: "High",
      status: "Todo",
    },
    {
      title: "Automated Integration Testing & QA",
      description: "Create automated test suites, validate edge cases, and verify endpoint security.",
      assignedAgent: "Tester Agent",
      priority: "Medium",
      status: "Backlog",
    },
    {
      title: "Security & Code Quality Review",
      description: "Conduct static code analysis, vulnerability inspection, and code optimization.",
      assignedAgent: "Reviewer Agent",
      priority: "Medium",
      status: "Backlog",
    },
    {
      title: "Technical Documentation & API Specs",
      description: "Generate README documentation, API endpoint references, and setup guides.",
      assignedAgent: "Documentation Agent",
      priority: "Low",
      status: "Backlog",
    },
  ];
};

/**
 * Fallback engine for general AI queries
 */
/**
 * Generates full multi-agent output files & code artifacts
 */
/**
 * Infer Domain Specification from Project Title, Description, and Requirements
 */
const inferDomainSpec = (title = "", desc = "", reqs = "") => {
  const combined = `${title} ${desc} ${reqs}`.toLowerCase();

  if (combined.includes("library") || combined.includes("book") || combined.includes("borrow")) {
    return {
      domain: "library",
      brandName: "LibMax Suite",
      icon: "📚",
      pages: ["Dashboard", "Books Catalog", "Members Roster", "Issue / Return", "Overdue Tracker", "Reports"],
      metrics: [
        { label: "Total Books", value: "3,840", trend: "124 New Additions", color: "#06b6d4" },
        { label: "Issued Books", value: "412", trend: "Active Borrowers", color: "#3b82f6" },
        { label: "Overdue Books", value: "18", trend: "Requires Action", color: "#ef4444" },
        { label: "Registered Members", value: "1,290", trend: "Faculty & Students", color: "#10b981" }
      ],
      tableTitle: "Library Books Catalog & Circulation Status",
      columns: ["Book ID", "Title & Author", "Category", "Status", "Issued To / Due Date", "Actions"],
      initialData: [
        { id: "BK-901", col1: "Clean Code — Robert C. Martin", col2: "Software Eng", status: "Issued", extra: "Aarav Patel (Due Aug 18)" },
        { id: "BK-902", col1: "Database System Concepts — Silberschatz", col2: "Computer Science", status: "Available", extra: "Library Shelf B-4" },
        { id: "BK-903", col1: "Design Patterns — Gang of Four", col2: "Architecture", status: "Overdue", extra: "Priya Shah (Due Aug 10)" },
        { id: "BK-904", col1: "Introduction to Algorithms — CLRS", col2: "Algorithms", status: "Available", extra: "Library Shelf A-2" },
        { id: "BK-905", col1: "Artificial Intelligence — Russell & Norvig", col2: "AI & ML", status: "Issued", extra: "Rohan Verma (Due Aug 22)" }
      ]
    };
  }

  if (combined.includes("restaurant") || combined.includes("food") || combined.includes("order") || combined.includes("menu") || combined.includes("dish")) {
    return {
      domain: "restaurant",
      brandName: "Gourmet POS",
      icon: "🍽️",
      pages: ["Dashboard", "Live Orders", "Menu Management", "Table Reservations", "Billing & POS", "Analytics"],
      metrics: [
        { label: "Today's Orders", value: "184", trend: "↑ 18% vs Yesterday", color: "#10b981" },
        { label: "Total Revenue", value: "₹42,850", trend: "Average Ticket ₹233", color: "#06b6d4" },
        { label: "Active Tables", value: "14 / 20", trend: "70% Occupancy Rate", color: "#3b82f6" },
        { label: "Kitchen Orders", value: "6 Pending", trend: "Avg Prep Time 12m", color: "#f59e0b" }
      ],
      tableTitle: "Live Restaurant Orders & Dining Tables",
      columns: ["Order ID", "Table / Customer", "Items Ordered", "Total Amount", "Status", "Actions"],
      initialData: [
        { id: "ORD-501", col1: "Table 4 (Dine In)", col2: "2x Paneer Tikka, 4x Butter Naan", status: "Cooking", extra: "₹940" },
        { id: "ORD-502", col1: "Takeaway #12", col2: "1x Hakka Noodles, 2x Cold Coffee", status: "Ready", extra: "₹450" },
        { id: "ORD-503", col1: "Table 12 (Dine In)", col2: "3x Veg Biryani, 3x Soft Drinks", status: "Served", extra: "₹1,120" },
        { id: "ORD-504", col1: "Online Express", col2: "1x Dal Makhani, 2x Laccha Paratha", status: "Dispatched", extra: "₹520" }
      ]
    };
  }

  if (combined.includes("inventory") || combined.includes("stock") || combined.includes("warehouse") || combined.includes("supplier")) {
    return {
      domain: "inventory",
      brandName: "StockFlow Hub",
      icon: "📦",
      pages: ["Dashboard", "Products Roster", "Stock Alerts", "Suppliers", "Purchase Orders", "Reports"],
      metrics: [
        { label: "Total SKUs", value: "2,410", trend: "14 Categories", color: "#06b6d4" },
        { label: "Stock Valuation", value: "$184,500", trend: "Asset Benchmark", color: "#10b981" },
        { label: "Low Stock Items", value: "12 SKUs", trend: "Reorder Required", color: "#ef4444" },
        { label: "Pending Shipments", value: "5 Orders", trend: "Arriving Tomorrow", color: "#3b82f6" }
      ],
      tableTitle: "Warehouse Inventory & SKU Stock Level Control",
      columns: ["SKU Code", "Product Description", "Category", "Status", "Quantity / Warehouse", "Actions"],
      initialData: [
        { id: "SKU-108", col1: "Wireless Ergonomic Mouse", col2: "Peripherals", status: "In Stock", extra: "142 units (Bin A-12)" },
        { id: "SKU-109", col1: "Mechanical RGB Keyboard", col2: "Peripherals", status: "Low Stock", extra: "4 units (Bin A-14)" },
        { id: "SKU-110", col1: "UltraWide 34'' Monitor", col2: "Displays", status: "In Stock", extra: "38 units (Rack B-02)" },
        { id: "SKU-111", col1: "USB-C Multiport Hub", col2: "Accessories", status: "Out of Stock", extra: "0 units (Bin C-01)" }
      ]
    };
  }

  // Default: Student Attendance System
  return {
    domain: "attendance",
    brandName: "EduTrack SaaS",
    icon: "🎓",
    pages: ["Dashboard", "Students Roster", "Attendance Marking", "Percentages & Reports", "Settings"],
    metrics: [
      { label: "Total Enrolled Students", value: "128", trend: "Computer Science Dept", color: "#06b6d4" },
      { label: "Present Today", value: "119", trend: "↑ 93.0% Attendance Rate", color: "#10b981" },
      { label: "Absent Today", value: "9", trend: "↓ 7.0% Absence Rate", color: "#ef4444" },
      { label: "Average Attendance %", value: "93.8%", trend: "Semester 6 Benchmark", color: "#3b82f6" }
    ],
    tableTitle: "Student Attendance Roster & Percentage Calculations",
    columns: ["Roll No", "Student Name", "Department", "Status", "Overall Attendance %", "Actions"],
    initialData: [
      { id: "CS-101", col1: "Alex Johnson", col2: "Computer Science", status: "Present", extra: "96.5% Attendance" },
      { id: "CS-102", col1: "Sophia Martinez", col2: "Computer Science", status: "Present", extra: "94.2% Attendance" },
      { id: "CS-103", col1: "Ethan Williams", col2: "Information Tech", status: "Absent", extra: "78.0% Attendance" },
      { id: "CS-104", col1: "Olivia Brown", col2: "Computer Science", status: "Present", extra: "98.1% Attendance" },
      { id: "CS-105", col1: "Liam Davis", col2: "Software Eng", status: "Present", extra: "91.5% Attendance" }
    ]
  };
};

/**
 * Generates full multi-agent output files & code artifacts
 */
const generateProjectArtifacts = async (projectTitle, projectDesc, category = "Web App", requirements = "") => {
  const title = projectTitle || "Swarm App";
  const desc = projectDesc || "Autonomous application generated by SwarmOS agents.";
  const reqs = requirements || desc;

  // Infer domain specification dynamically
  const spec = inferDomainSpec(title, desc, reqs);
  const hasAdmin = reqs.toLowerCase().includes("admin");

  const pageNavHtml = spec.pages
    .map((p, idx) => `<div class="nav-item ${idx === 0 ? "active" : ""}" onclick="selectTab('${p}')">${p}</div>`)
    .join("\n      ");

  const metricsHtml = spec.metrics
    .map(
      (m, i) => `
      <div class="stat-card">
        <div class="label">${m.label}</div>
        <div class="value" id="metric-${i}" style="color:${m.color};">${m.value}</div>
        <div class="trend">${m.trend}</div>
      </div>`
    )
    .join("\n");

  const tableHeaderHtml = spec.columns.map((c) => `<th>${c}</th>`).join("\n            ");

  const tableRowsHtml = spec.initialData
    .map(
      (d, idx) => `
          <tr id="row-${idx}">
            <td><strong>${d.id}</strong></td>
            <td>${d.col1}</td>
            <td>${d.col2}</td>
            <td><span class="${d.status === "Present" || d.status === "Available" || d.status === "In Stock" || d.status === "Served" ? "badge-present" : "badge-absent"}" id="status-${idx}">${d.status}</span></td>
            <td id="extra-${idx}">${d.extra}</td>
            <td><button class="btn-action" onclick="toggleRowStatus(${idx})">Toggle Status</button></td>
          </tr>`
    )
    .join("\n");

  return [
    {
      fileName: "PRD.md",
      filePath: "docs/PRD.md",
      fileType: "document",
      language: "markdown",
      generatedByAgent: "Planner Agent",
      content: `# Product Requirements Document (PRD)

## Project Name: ${title}
**Domain:** ${spec.domain.toUpperCase()} | **Brand:** ${spec.brandName}
**Status:** Approved & Materialized by SwarmOS AI Agent Swarm

### 1. Executive Summary & Target Scope
${desc}

### 2. Functional Requirements & Key Modules
1. **Core Dashboard & Metrics Engine**: Live rendering of key metrics (${spec.metrics.map((m) => m.label).join(", ")}).
2. **Domain Workspace Controls**: Search, filter, status toggles, and data grid navigation.
3. **User Access Control**: ${hasAdmin ? "Admin Login & Role-Based Access Control Enabled" : "Standard User Workspace Access"}.
4. **Data Persistence Strategy**: Local state management with reactive DOM event handlers.

### 3. Non-Functional Criteria
- **Performance**: Instant DOM hydration under 50ms.
- **Responsiveness**: Mobile & Desktop friendly layout.
`,
    },
    {
      fileName: "ARCHITECTURE.md",
      filePath: "docs/ARCHITECTURE.md",
      fileType: "document",
      language: "markdown",
      generatedByAgent: "Planner Agent",
      content: `# System Architecture & Technology Topology

## System Diagram
\`\`\`
[ User Browser (Interactive HTML5/CSS3/JS) ] <---> [ SwarmOS Express Runtime (Port 5000) ]
                                                            ^
                                                            |
                                                [ SwarmOS MongoDB Engine ]
\`\`\`

## Architecture Highlights
- **Domain Type:** ${spec.domain}
- **Primary Pages:** ${spec.pages.join(", ")}
- **State Management:** Reactive Client State Hydration.
`,
    },
    {
      fileName: "styles.css",
      filePath: "public/styles.css",
      fileType: "code",
      language: "css",
      generatedByAgent: "Frontend Agent",
      content: `/* SwarmOS Generated Theme & Styles - ${spec.brandName} */
:root {
  --bg-dark: #09090b;
  --bg-card: #18181b;
  --bg-hover: #27272a;
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-red: #ef4444;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
  --border: #27272a;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #09090b;
  border-right: 1px solid var(--border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.brand {
  font-size: 16px;
  font-weight: 800;
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-menu { display: flex; flex-direction: column; gap: 6px; }

.nav-item {
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.nav-item.active, .nav-item:hover { background: var(--bg-hover); color: #fff; }

.main-content { flex: 1; padding: 32px; overflow-y: auto; }

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}

.stat-card .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.stat-card .value { font-size: 28px; font-weight: 800; margin-top: 6px; color: var(--text-main); }
.stat-card .trend { font-size: 11px; color: var(--accent-emerald); margin-top: 4px; }

.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.input-field {
  flex: 1;
  background: #09090b;
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  outline: none;
}

table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
th { text-align: left; padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase; }
td { padding: 14px 12px; border-bottom: 1px solid #1f1f23; }

.badge-present { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; }
.badge-absent { background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; }

.btn-primary {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-action {
  background: #27272a;
  color: #e4e4e7;
  border: 1px solid #3f3f46;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.btn-action:hover { background: #3f3f46; }
`,
    },
    {
      fileName: "index.html",
      filePath: "public/index.html",
      fileType: "code",
      language: "html",
      generatedByAgent: "Developer Agent",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ${spec.brandName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <aside class="sidebar">
    <div class="brand">
      <span>${spec.icon}</span> ${spec.brandName}
    </div>
    <nav class="nav-menu">
      ${pageNavHtml}
    </nav>
  </aside>

  <main class="main-content">
    <header class="header-bar">
      <div>
        <h1 style="margin:0; font-size:22px; color:#06b6d4;">${title}</h1>
        <p style="margin:4px 0 0 0; color:#a1a1aa; font-size:13px;">${desc}</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        ${hasAdmin ? `<span style="background:rgba(16,185,129,0.15); color:#10b981; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:bold;">Admin Mode Active</span>` : ""}
        <button class="btn-primary" onclick="triggerMainAction()">+ Add New Item</button>
      </div>
    </header>

    <section class="metrics-grid">
      ${metricsHtml}
    </section>

    <section class="table-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:16px;">${spec.tableTitle}</h3>
        <span style="font-size:12px; color:#a1a1aa;">Active Data Workspace</span>
      </div>

      <div class="search-bar">
        <input type="text" id="search-input" class="input-field" placeholder="Search records by keyword..." onkeyup="filterTable()">
      </div>

      <table>
        <thead>
          <tr>
            ${tableHeaderHtml}
          </tr>
        </thead>
        <tbody id="table-body">
          ${tableRowsHtml}
        </tbody>
      </table>
    </section>
  </main>

  <script src="app.js"></script>
</body>
</html>
`,
    },
    {
      fileName: "app.js",
      filePath: "public/app.js",
      fileType: "code",
      language: "javascript",
      generatedByAgent: "Developer Agent",
      content: `// Interactive Application Script for ${title} (${spec.brandName})
function toggleRowStatus(id) {
  const statusEl = document.getElementById("status-" + id);
  if (!statusEl) return;

  if (statusEl.className === "badge-present") {
    statusEl.className = "badge-absent";
    statusEl.innerText = "Inactive / Pending";
  } else {
    statusEl.className = "badge-present";
    statusEl.innerText = "Active / Available";
  }
}

function triggerMainAction() {
  const keyword = prompt("Enter new item description / record name:");
  if (!keyword || !keyword.trim()) return;

  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  const newRow = document.createElement("tr");
  const randomId = "REC-" + Math.floor(100 + Math.random() * 900);
  newRow.innerHTML = \`
    <td><strong>\${randomId}</strong></td>
    <td>\${keyword}</td>
    <td>General Module</td>
    <td><span class="badge-present">Active</span></td>
    <td>Created Just Now</td>
    <td><button class="btn-action" onclick="this.closest('tr').remove()">Remove</button></td>
  \`;
  tbody.prepend(newRow);
}

function filterTable() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const rows = document.querySelectorAll("#table-body tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
}

function selectTab(pageName) {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(el => {
    if (el.innerText.includes(pageName)) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}
`,
    },
    {
      fileName: "package.json",
      filePath: "package.json",
      fileType: "config",
      language: "json",
      generatedByAgent: "Developer Agent",
      content: JSON.stringify(
        {
          name: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          version: "1.0.0",
          description: desc,
          main: "public/index.html",
        },
        null,
        2
      ),
    },
    {
      fileName: "README.md",
      filePath: "README.md",
      fileType: "document",
      language: "markdown",
      generatedByAgent: "Documentation Agent",
      content: `# ${title} — ${spec.brandName}

${desc}

## Generated Stack & Domain Specifications
- **Domain Classification:** ${spec.domain}
- **Primary Pages:** ${spec.pages.join(", ")}
- **Generated by SwarmOS AI Agent Swarm**
`,
    },
  ];
};

module.exports = {
  generateContent,
  generateTasksFromRequirements,
  generateProjectArtifacts,
  inferDomainSpec,
};


