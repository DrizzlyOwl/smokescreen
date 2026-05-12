# SMOKESCREEN Codebase TODOs

## 1. Common-Fault Areas
- [x] **Fragile String Matching:** Refactor `useIncidentStore` (`healNodes`) and `TacticalOverview` (`handleNodeClick`). Current implementation relies on hardcoded strings that will break if naming conventions change.
- [ ] **Timer Race Conditions:** Address timer management in `useIncidentState` and `useIncidentChat`. Migrate away from raw `setInterval`/`setTimeout` or implement robust synchronization to prevent race conditions and stale closures.
- [ ] **Hardcoded Constants:** Refactor `OutageMap` to remove dependency on fixed SVG dimensions (2754x1398). Make coordinate mapping dynamic based on viewport.
- [ ] **Stale UI State:** Fix `PaneGrid` direct state access (`getState()`) in render paths. Ensure components subscribe properly to store updates to trigger re-renders.

## 2. Complexity & Abstraction
- [x] **Deconstruct God Hook:** Break down `src/hooks/useIncidentState.ts` (18KB orchestrator) into specialized, domain-specific hooks (e.g., `useOnboarding`, `useChaosEvents`, `useCommandHandling`).
- [x] **Store Logic Separation:** Refactor `useIncidentStore.ts`. Move complex business logic (like node healing and Gemini API calls) out of the Zustand store into dedicated service modules or utility functions.
- [x] **Abstract Chat Data:** Extract massive static data objects from `src/hooks/useIncidentChat.ts` (23KB) into separate data files or configuration modules.
- [ ] **Decouple UI Logic:** Refactor `ChatPane.tsx` and `ChatMessageItem.tsx`. Extract the complex `IntersectionObserver` logic used for tracking unread messages into a custom hook (e.g., `useUnreadTracker`) to improve testability.
- [x] **Audio Engine Utility:** Replace the manual pooling logic in `src/contexts/AudioContext.tsx` with a dedicated Audio Engine utility for better maintainability.

## 3. Code Coverage Issues
- [ ] Add unit tests for major UI components:
  - [x] `ChatPane`
  - [x] `OutageMap`
  - [x] `SystemLog`
  - [x] `DeploymentStatus`
- [ ] Add unit tests for core utilities:
  - [x] `src/utils/team.ts` (persona generation)
  - [x] `src/utils/logWorker.ts` (telemetry generation)
- [ ] Add unit tests for critical hooks:
  - [x] `useSync.ts` (cross-tab synchronization)
  - [x] `useClientStats.ts` (browser API integration)

## 4. Defunct & Dead Code
- [x] **Remove Dead Component:** Delete `src/components/AccessDenied.tsx` (defined but never imported/used).
- [x] **Remove Empty Action:** Remove or implement the `copyPlaybook` action (currently a no-op).
- [x] **Remove Redundant Logic:** Refactor `src/utils/team.ts` to remove `getBioByRole`, as it duplicates information already present in persona templates.
