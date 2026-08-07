# HANDOFF.md - SMOKESCREEN v6.0

## Project Status
**SMOKESCREEN** (v6.0 "Orchestrator Edition") stable. High-fidelity incident theatre simulation. Core loop (Onboarding -> Declare -> Resolve) functional.

## Recent Wins
- **Deconstructed God Hook**: `useIncidentState` split into domain hooks (`useOnboarding`, `useChaosEvents`).
- **Audio Engine Refactor**: Manual pooling replaced by unified `AudioEngine` utility.
- **Store Refactor**: Complex logic (node healing, slow-burn) extracted to `incidentService` and `reportService`.
- **Test Coverage**: Added unit tests for `ChatPane`, `OutageMap`, `SystemLog`, `DeploymentStatus`, and core hooks (`useSync`, `useClientStats`).
- **Dead Code Purge**: Removed unused components (`AccessDenied`) and redundant logic.
- **AI Removal**: Removed Google Gemini AI integration; all features now use local procedural generation.

## Technical Debt / Known Issues
- **Timer Race Conditions**: `useIncidentState` and `useIncidentChat` use raw `setInterval`. Risk of stale closures. Needs robust sync.
- **OutageMap Scaling**: SVG dimensions (2754x1398) hardcoded. Coordinate mapping needs dynamic viewport calculation.
- **Chat Logic Coupling**: `IntersectionObserver` logic for unread tracking inside `ChatPane`. Extract to `useUnreadTracker` hook.

## Next Priorities
1. **Fix Timers**: Migrate `setInterval` to synchronized tick system or `useInterval` hook.
2. **Dynamic Map**: Implement coordinate scaling in `OutageMap` for varied screen sizes.
3. **Store Refactor**: Extract node management logic from Zustand into dedicated utilities.
4. **Expand Tests**: Target `useWindowManager` and `useTerminal` for next test suite.

## Architecture Reminders
- **BEM**: Strictly follow BEM for SCSS.
- **No Globals**: Use context/Zustand for state. No global window variables.
- **Type Safety**: Zero `any`. Use interfaces in `src/contexts/types.ts`.
- **Session State**: All UI state persists locally in user sessions (no query parameter syncing).

---
*Generated: 2026-05-12*
