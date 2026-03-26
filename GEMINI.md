# GEMINI.md - SMOKESCREEN Project Context

## 1. Project Objective
**SMOKESCREEN** is a "theater-as-a-service" tool designed for Platform and DevOps engineers. It generates hyper-technical, convincing excuses for exiting unnecessary meetings, complete with a suite of visual and auditory "evidence" to support the claim.

**Source:** [GitHub Repository](https://github.com/DrizzlyOwl/smokescreen)
**Copyright:** DrizzlyOwl

## 2. Technical Stack
- **Frontend:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (CRT filters, Gaussian flicker, scanlines).
- **Audio:** Web Audio API (procedural synthesis).
- **Automation:** GitHub Actions for GH Pages deployment.

## 3. Core Features (v4.5)
- **DXW Branded Entry:** Secure logon screen with operator identification.
- **Fallout-Style Terminal:** Immersive CRT aesthetic with Gaussian flicker and radial glow.
- **Command Interface:** Keyboard-navigable prompt for controlling the entire system.
- **Dynamic Evidence Panes:**
    - **Incident Chat:** Slack-style conversation with DXW technical staff and `incident_io` bot.
    - **System Log:** Full-screen tailing of `/VAR/LOG/KERN.LOG` with syntax highlighting.
    - **Outage Map:** Global region map with active incident indicators.
- **Slow Burn Mode:** Scripted 90-second escalation from Nominal to Catastrophic Failure with countdown.
- **Boss Mode (Cmd+B):** Instant high-fidelity macOS update cover screen.
- **Excuse Engine:** Cascade-aware jargon generator with Ticket IDs and 403-Restricted alibi pages.
- **Life Reclaimed:** Local storage tracker for hours saved from unnecessary meetings.

## 4. Operational Controls
- **Double-ESC:** Quick Abort (Trigger Ejection).
- **Cmd+B / Ctrl+B:** Toggle Boss Mode.
- **Command Line:** `show chat`, `show logs`, `p0`, `aws`, `abort`, etc.

## 5. Pro Features (Planned)
- **💸 Burn Rate Dashboard:** Real-time financial loss counter based on incident severity.
- **🚨 Slack Ping Audio:** Procedural synthesis of the Slack notification sound to create psychological urgency.
- **🏗️ Failing Deployment View:** Simulated failing Terraform/Kubernetes rollout screen.
- **📟 PagerSync:** QR code linking to a mobile-optimized pager app that vibrates and alerts.

---
*Last Updated: 26 March 2026 | DXW AI Hackathon*
