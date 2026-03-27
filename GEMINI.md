# GEMINI.md - SMOKESCREEN Project Context

## 1. Project Objective
**SMOKESCREEN** is a "Technical Incident Theatre" simulation suite designed for Platform and DevOps engineers. It generates hyper-technical, convincing simulations of catastrophic system failures, complete with real-time cross-device synchronization and authentic hardware aesthetics to provide high-fidelity "performance cover" during unnecessary meetings.

**Source:** [GitHub Repository](https://github.com/DrizzlyOwl/smokescreen)
**Copyright:** DrizzlyOwl

## 2. Technical Stack
- **Frontend:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Sync:** P2P WebRTC via PeerJS (DataChannels)
- **Styling:** SCSS (BEM architecture, CSS Variable API, Theme-aware assets).
- **Audio:** Web Audio API (procedural synthesis, graph-based architecture).
- **Simulation:** Faker.js (Identities), Gemini 1.5 Flash (AI Intelligence).

## 3. Core Features (v5.0 - "Theatre Edition")
- **Instant P2P Uplink:** Real-time WebRTC synchronization between terminal and mobile devices with immediate state-on-connect handshakes via **SRE-XXXX** room codes.
- **Authentic CRT Simulation:** 
    - **Phosphor Warm-up:** Theme-aware horizontal-to-vertical beam expansion on boot.
    - **Simulation Instability:** "Chaotic" UI mode with physical screen jitter, skew, and brightness spikes during declared incidents.
- **Multi-Identity War Room:** Persistent Faker-powered identities (10 unique staff members) with stack-specific technical context and manual operator chat injection.
- **Cloud-Stack Awareness:** 110+ unique technical messages tailored to AWS, GCP, Azure, On-Prem, and Serverless architectures.
- **Live System Debug:** Real-time telemetry console tracking every internal state transition and user action via global sync hooks.
- **Slow Burn Protocol:** Scripted escalation from Nominal to Catastrophic Failure with coordinated metric spikes.
- **Boss Mode (Cmd+B):** Instant high-fidelity macOS update cover screen.

## 4. Completed Optimization Phases
- [x] **Phase 1-6:** (Bundle Opt, Theme API, Context Refactor, Audio Graph, Testing, Visual Polish).
- [x] **Phase 7: WebRTC & Cross-Device Sync:** Replaced Broadcast API with PeerJS for true P2P synchronization and persistent mobile uplinks.
- [x] **Phase 8: Authentic Hardware Simulation:** Implemented theme-aware CRT boot sequences and simulation instability effects.
- [x] **Phase 9: Technical Theatre Rebranding:** Standardized terminology around "Declaration" and "Playbooks" to align with simulation goals.
- [x] Phase 10: Human-Readable Uplinks: Implemented `SRE-XXXX` room code system and manual join gateway.
- [x] Phase 11: Visual Componentization & Density: Extracted atomic visual components (`ActionGroup`, `ReadoutBox`, `StatReadout`, `Footer`) and increased global data density.

## 5. Future Recommendations & Optimisations (v6.0 Roadmap)

### Performance & Core
- [x] **Eco Mode (Low Power):** Implement a toggle to disable expensive CSS filters (Gaussian blur, radial glow, scanline animations) for better performance on older hardware.
- [ ] **Audio Node Recycling:** Refactor `AudioContext` to use an object pool for oscillator and gain nodes to minimize garbage collection overhead.
- [ ] **Strict Typing Audit:** Eliminate remaining `any` types in WebRTC handshakes and command action handlers.

### Architecture
- [ ] **Component Splitting:** Extract the `Secure Gateway` and `System Control Cluster` from `App.tsx` into standalone components.
- [ ] **Window State Persistence:** Save window positions, sizes, and z-indices to `localStorage` to preserve custom operator layouts.
- [ ] **Command Controller Hook:** Move command registry and keyboard orchestration into a dedicated `useAppCommands` hook.

### Theatrics
- [ ] **Scripted Incident "Playbooks":** Define JSON-based scenarios (e.g., "The DNS Meltdown") that orchestrate specific, timed sequences of chat messages, log errors, and metric spikes.
- [ ] **WebHID Integration:** Link physical peripheral LEDs to incident severity (e.g., flashing red keyboard during P0).
- [ ] **Global Extraction (2x ESC):** Synchronize the emergency reset signal to all linked mobile pagers simultaneously.

## 6. Operational Controls
- **Double-ESC / `resolve`:** Resolve incident state and clear alerts.
- **Cmd+B / Ctrl+B:** Toggle Boss Mode cover.
- **Command Line:** `declare`, `resolve`, `warroom`, `uplink`, `p0`, `aws`, `amber`, `debug`, etc.

---
*Last Updated: 27 March 2026 | SRE Incident Theatre*
