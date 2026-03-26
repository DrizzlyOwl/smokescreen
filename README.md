# 📟 SMOKESCREEN

**Theater-as-a-Service for Platform and DevOps Engineers.**

SMOKESCREEN is a tactical cover generator designed to help engineers exit unnecessary meetings with high-fidelity, hyper-technical, and completely fabricated evidence of a system-wide catastrophic failure.

![SMOKESCREEN Banner](src/assets/hero.png)

---

## 🎭 The Concept
"I'm sorry, I have to drop. The Prometheus scraper is reporting an OOM killer trigger on the EKS control plane. I need to start draining the Fargate nodes immediately."

SMOKESCREEN turns that sentence into a full-scale digital production. It simulates a high-stakes SRE incident on your second monitor, complete with flickering CRT filters, scrolling kernel logs, and panicking Slack messages, giving you the perfect "eject" button for any meeting.

## 🚀 Core Features (v4.5)
- **📟 DXW Secure Gateway:** A branded, immersive boot sequence and operator identification system.
- **🖥️ CRT Terminal Aesthetic:** Authentic Fallout-style terminal interface with Gaussian flicker, scanlines, and radial glow.
- **🎛️ Command-Line Interface:** Keyboard-navigable prompt to control the entire simulation.
- **📊 Dynamic Evidence Panes:**
    - **Incident Chat:** Simulated Slack/incident.io conversation with DXW technical staff.
    - **System Log:** Real-time tailing of a simulated `/VAR/LOG/KERN.LOG` with syntax highlighting.
    - **Outage Map:** A global region map with active incident indicators.
    - **Deployment Status:** Live visualization of a failing Kubernetes/Terraform rollout.
- **🔥 Slow Burn Mode:** A scripted 90-second escalation from "Nominal" to "Catastrophic Failure," including countdowns and automated alerts.
- **🕴️ Boss Mode (Cmd+B):** Instant high-fidelity macOS update cover screen for when the *actual* boss walks by.
- **🤖 Excuse Engine:** Stack-aware jargon generator (AWS, GCP, Azure, On-Prem, Serverless) that provides Ticket IDs and 403-Restricted alibi pages.
- **⏳ Life Reclaimed:** A local storage tracker for every minute you've saved from unnecessary meetings.

## 🛠️ Technical Stack
- **Frontend:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (Advanced CRT filters, radial gradients, CSS animations).
- **Audio:** Web Audio API (Procedural synthesis of Slack/Teams pings and incident sirens).
- **QR/Sync:** `qrcode.react` for mobile pager synchronization.

## ⌨️ Operational Controls
| Command | Action |
| :--- | :--- |
| **Double-ESC** | Quick Abort (Trigger Emergency Extraction) |
| **Cmd+B / Ctrl+B** | Toggle Boss Mode (macOS Update Screen) |
| **`help`** | View all available terminal commands |
| **`show [pane]`** | Open panes: `chat`, `logs`, `map`, `deploy`, `burn`, `pager` |
| **`p0 / p1 / p3`** | Manually set the incident threat level |
| **`aws / gcp / azure`** | Switch the cloud stack jargon |

## 📦 Getting Started

### Prerequisites
- Node.js (v20+)
- npm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/DrizzlyOwl/smokescreen.git

# Navigate to the project directory
cd smokescreen

# Install dependencies
npm install

# Run the development server
npm run dev
```

## ⚖️ Disclaimer
This project is for **educational and entertainment purposes only**. Use SMOKESCREEN responsibly. We are not liable for any sprint goals missed while you were "re-indexing the DynamoDB shards."

---
**Copyright © 2026 DrizzlyOwl | DXW AI Hackathon**
