# SMOKESCREEN v6.0 - Orchestrator Edition

> **High-Fidelity Technical Incident Theatre for SREs and Platform Engineers.**

SMOKESCREEN is an immersive incident simulation game designed to test your Platform Engineering skills under pressure. Experience the chaos of catastrophic system failures in a high-fidelity, arcade-style environment.

## 🚀 Key Features

### 🛠️ Centralized Command & Control
A unified state management architecture that synchronizes global preferences (Theme, Eco Mode, Audio) with incident-specific parameters (Severity, Stack). 

### 🔗 Deep URL Synchronization
Share your exact simulation configuration. Every parameter—from active observability panes to threat levels and UI themes—is serialized into the URL for instant session recovery or manual state sharing.

### 🖼️ Safety-First Window Management
Draggable and resizable panes are automatically constrained to the viewport. The system ensures that headers remain accessible and panes never become "lost" outside the visible area, even during high-chaos simulations.

### 📟 Intelligent War Room
A Slack-fidelity chat experience featuring:
- **Smart Unread Indicators**: Tracks user attention via `IntersectionObserver`.
- **Dwell Verification**: Messages mark as read only after 3 seconds of active view.
- **Dynamic Identities**: User avatars and technical bios generated on-the-fly.
- **Visual Grouping**: Precise message indentation and grouping for maximum authenticity.
- **Executive Interruptions**: Multitasking challenges where high-level stakeholders (CTO, VP Eng) demand immediate SITREPs. Failure to reply in the chat incurs severe "market cap" penalties.

### 📺 Hardware-Accurate Simulation
- **BIOS Boot Sequence**: Loads technical modules based on URL parameters.
- **CRT Aesthetics**: Phosphor warm-up animations and simulation jitter during P0 alerts.
- **Locked Terminal**: The core CLI remains permanently active and cannot be closed, anchoring the gameplay experience.
- **Slowburn (Survival Mode)**: Engage an automated escalation loop that takes you from Nominal to P0, increasing difficulty and event frequency over time.
- **Eco Mode**: High-performance toggle to disable expensive CSS filters for older hardware.

### 🎮 Arcade Mitigation Minigames
Engage in high-stakes tasks to resolve the simulation and survive the shift:
- **Terminal Overrides**: High-speed typing challenges. When a critical failure occurs, the terminal locks until you perfectly type a randomized 12-character override code within 20 seconds.
- **Punitive Logic**: Every typo and missed deadline in the terminal directly increases the "Money Lost" burn rate.
- **Node Failover Puzzle**: Manually route traffic from failing nodes (red) to healthy nodes (green) on the Outage Map using drag-and-drop.
- **High-Stakes Approval Modals**: Respond to randomized, critical system prompts by either typing complex authorization phrases or holding a "Deploy" button for 3 seconds. Context-aware jargon based on your active stack.

### 🏆 After-Action Reporting (AAR)
Once an incident is resolved, the system generates a detailed mission summary:
- **Mitigation Score**: Credits earned based on incident severity and response time.
- **Remediation Guard**: Prevents premature resolution. Operators must log at least one interactive mitigation action (failover or override) before an incident can be officially closed.
- **System Stability Verification**: Provides authentic feedback on mission success.

### 🔊 Procedural Audio Graph
A global audio system that generates authentic server room ambient noise and fan hums that scale with incident severity. Features specialized success chimes for successful mitigations.

## 🎮 Quick Start

1. **Enter Operator Name**: Identify yourself at the Secure Gateway.
2. **Complete Certification**: If it's your first time, the Terminal will guide you through a mandatory "Incident Certification" protocol. Follow the on-screen prompts to learn the core loop.
3. **Configure Environment**: Select your Stack (AWS, GCP, etc.) and set a Severity level.
4. **Declare Incident**: Trigger the theatre.
5. **Deploy Panes**: Open Kernel Logs, K8s Status, and the War Room to increase visual data density.

## ⌨️ Tactical Shortcuts

- **ESC**: Reset Terminal Input
- **2x ESC**: Emergency Extraction (Resolve All)
- **?**: View Command Registry

---
*Disclaimer: For educational and entertainment purposes only. Please use SMOKESCREEN responsibly.*
