# GEMINI.md - SMOKESCREEN Project Context

## 1. Project Objective
**SMOKESCREEN** is "Technical Incident Theatre" simulation game for Platform and DevOps engineers. Generate hyper-technical, immersive simulations of catastrophic system failures. Authentic hardware aesthetics + high-stakes arcade gameplay.

## 2. Technical Stack
- **Frontend:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** SCSS (BEM architecture, modular per-component styles, CSS Variable API).
- **Audio:** Web Audio API (procedural synthesis, graph-based architecture, global mute orchestration).
- **Simulation:** UI Avatars (Identities), Gemini 1.5 Flash (AI Intelligence).

## 3. Core Features (v6.0 - "Orchestrator Edition")
- **Centralized State Management**: Unified handling of global app state, incident parameters, and UI preferences via context-based orchestrator.
- **Deep URL Synchronization**: App state (Threat Level, Stack, Theme, Panes, Eco/Debug) serialized into URL. Instant sharing + persistence.
- **Dynamic Boot Sequencing**: Hardware-accurate BIOS sequence loads modules based on active URL parameters.
- **Intelligent Chat**: 
    - **Smart Unread System**: IntersectionObserver + 3s "dwell" requirement.
    - **Visual Grouping**: Slack-fidelity message grouping.
    - **Interactive Bios**: Technical specialization (SRE, DBA, etc.) shown on click.
    - **Executive Interruptions**: High-stakes multitasking. VP Eng, CISO, CTO demand SITREPs. Failure to reply = massive financial penalties.
- **Authentic CRT Simulation**: Theme-aware warm-up expansions + jitter.
- **Terminal-First Arcade Gameplay**:
    - **Locked Terminal Architecture**: `SYSTEM_TERMINAL_CORE` is permanent fixture. Primary interaction point.
    - **Emergency Overrides**: Arcade/typing minigames in terminal. Type complex, randomized codes under time pressure.
    - **Punitive Typing**: Mistypes/delays = financial penalties to burn rate.
    - **Guided Onboarding**: Hands-on tutorial. "Certification" mission teaches loop (Stack -> Threat -> Declare -> Resolve).
- **Interactive Mitigation Minigames**: 
    - **Failover Puzzle**: Drag-and-drop routing on Outage Map.
    - **Approval Modals**: Phrase-typing, 3s button hold, or slider acknowledge.
- **After-Action Reporting (AAR)**:
    - **Mission Summary**: Post-resolution modal. Mitigation score + actions executed.
    - **Remediation Guard**: Prevent resolution unless mitigation action logged.
- **Global Audio Extract (Mute)**: Single point control for procedural hums + fan noise.

## 4. Operational Controls
- **Double-ESC / `resolve`**: Resolve incident state + clear alerts.
- **Command Line**: `declare`, `resolve`, `chat`, `p0`, `aws`, `amber`, `debug`, etc.
- **URL Control**: `?sev=P0&stack=GCP&theme=amber&panes=chat,logs,map` pre-configures theatre.

## 5. Architectural Standards
- **BEM (Block Element Modifier)**: Semantic BEM classes in dedicated SCSS files.
- **Component Isolation**: Components are self-contained. No atomic utilities.
- **Strict Typing**: Zero `any` in core state handlers. Interface-guaranteed transitions.
- **Incident State**: `isDeclared` decoupled from `incidentReport` for immediate UI feedback.
- **Viewport Safety**: Draggable/resizable components constrained to viewport.

---
*Last Updated: 17 April 2026 | Arcade Pivot*
