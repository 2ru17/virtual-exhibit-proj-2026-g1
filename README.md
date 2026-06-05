# Virtual Exhibit Case Proposal - Group 1

**Section:** S03
**Category:** Problem Solving Stories

## Heartbleed: When the Internet’s Heart Started Bleeding Secrets

---

## Group Member Roster
- Gutang, Neil Jr. Langgamon
- Quijano, Myrvin Umapas
- Tan, Roberta Netanya
- Tolentino, Winelle Roxas 
- Wong, Allisha Kate Ubani

---

## Topic Theme: The Heartbleed Bug (2014)

Heartbleed is one of the most devastating security vulnerabilities in Internet history. Disclosed on April 7, 2014, it exploited a missing bounds check in OpenSSL's implementation of the TLS heartbeat extension. By sending a malformed heartbeat request with a mismatched payload length, an attacker could trick a vulnerable server into returning up to 64KB of its own process memory per request — including private keys, session tokens, and plaintext credentials — with no trace in server logs. This exhibit tells the full story: from the architectural flaw in OpenSSL's buffer handling, to the frantic global patch effort, to the long tail of unpatched servers that remained vulnerable for years. Heartbleed is a canonical case study in how a single missing line of validation code can compromise the internet's encrypted backbone.

---

## Group's Tech Stack Plan

**Runtime & Framework:** Node.js 26 and Astro 6. This ensures compatibility when all repositories are merged into the central museum website.

**UI/Components:**
- React (.jsx or .tsx) will be used to build interactive simulations embedded in .mdx content pages.
- Tailwind CSS for utility-first styling, scoped to the exhibit's visual theme while remaining compatible with the central museum template.

**Version Control:** All incremental plans, source code, and documentation will be hosted on GitHub. Team members will manage local Git credential configurations to ensure accurate commit histories prior to the final merge.

---

## Proposed Interactive Element

### The Heartbleed Hemorrhage Simulation

This simulation teaches the Heartbleed vulnerability through a three-stage interactive experience, implemented as a React component (HeartbleedSimulation.jsx) embedded in the MDX content page.

#### Stage 1 - Healthy Server Heart

A pulsing wireframe heart rendered in crimson is displayed to the user, representing an OpenSSL server operating normally. The heart pulses rhythmically to simulate a live TLS heartbeat exchange. A brief contextual tooltip explains what the heartbeat extension is and its intended purpose: a lightweight keep-alive ping between client and server.

- **Visual:** Animated wireframe heart (CSS/SVG), pulsing at ~1 Hz
- **User state:** Passive observation; a "Send Heartbeat Request" button becomes available
- **Educational goal:** Establish what normal looks like before the exploit is introduced

#### Stage 2 - The Attack: Memory Bleeds Out

The user clicks the heart to simulate sending a malformed heartbeat request — one that claims a payload of 64KB but actually sends only a few bytes. With each click, the heart visually cracks and shrinks, losing health. Binary data and memory fragments bleed out from the crack, simulating the server returning memory it should not have. Pop-up info cards appear progressively, revealing context about the exploit mechanics.

- **Visual:** Shrink animation, dripping binary particles, progressive info card reveals
- **Popup windows:** Simplified view of what leaked memory could contain (session cookies, private key fragments, usernames, passwords)
- **User interaction:** Click to send malformed requests
- **Educational goal:** Allow the user to visualize the severity of the memory leaks through stylized popup windows

#### Stage 3 - The Aftermath: A Bleeding World

Once the heart's health reaches zero, it shrinks significantly smaller, changes color, and rises to the top of the viewport. The background transitions to a visual showing affected services going offline one by one, each with a tooltip showing a real affected service (Yahoo, LastPass, OKCupid, etc.). Interactive buttons allow users to explore recovery methods, affected systems, the human cost, and the OpenSSL underfunding problem Heartbleed exposed.

- **Visual:** Affected services grid, cascading failures, action buttons
- **User interaction:** Click items and buttons for supplementary information
- **Educational goal:** Contextualize the global scale and transition from technical exploit to real-world consequences

---

## Mobile-Responsive Layout

The exhibit will feature a single-column stacked layout on mobile devices (breakpoint: < 768px):

- The interactive simulation is prioritized at the top with touch-friendly tap targets (minimum 44×44px hitboxes)
- Stage 2 info cards collapse into a swipeable carousel on mobile to prevent overflow
- Stage 3 uses a flat grid layout on mobile to ensure performance
- MDX educational content flows below the simulation in a readable single column
- All font sizes scale via clamp() for readability across viewport sizes

---

## Tentative Style Guide Snapshot

**Aesthetic Direction:** Dark, clinical, and visceral. Black backgrounds, crimson accents, and a forensic/terminal aesthetic that makes the vulnerability feel real and urgent. Typography mixes a monospace technical font with a clean sans-serif for body content.

**Component Library:** shadcn/ui

**Typography:** Fira Code / JetBrains Mono

---

## User Journey Flowchart
```mermaid
flowchart TD
    A[User Arrives at Exhibit]
    B[Reads Stage 1<br/>Healthy Heart<br/>Reads Tooltip]
    C[Clicks Heart<br/>Starts Attack]
    D[Sees Cracking Heart + Leaks<br/>Stage 2 Begins]
    E[Clicks Again<br/>More Leaks<br/>More Popups]
    F[Heart Dies<br/>Stage 3 Begins Automatically]
    G[Explores Affected Sites<br/>Clicks Logos<br/>Sees Tooltips]
    H[Clicks Fix Buttons<br/>Learns About Patch, Economic Cost, Funding Issue]
    I[Reads Timeline<br/>Historical Context]
    J[Understands the Full Story<br/>Exhibit Goal Achieved]

    A --> B --> C --> D --> E --> F --> G --> H --> I --> J
```

