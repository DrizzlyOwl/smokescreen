# SMOKESCREEN Style Guide

This document defines the language, vocabulary, and formatting standards for the SMOKESCREEN codebase.

## Terminology

Use consistent terminology throughout the UI:

| Preferred | Avoid |
|-----------|-------|
| Screen | Pane, Window (for full-viewport views) |
| Playbook | Runbook, Deck |
| Terminal | Shell, Console |
| Operator | User, Player |

## Capitalization

### System Labels
Use `SCREAMING_SNAKE_CASE` for system-generated labels, titles, and status messages:
```
SYSTEM_TERMINAL_CORE
PRIMARY_SYSTEM_OVERVIEW
INCIDENT_ESCALATED: P1 [CRITICAL_ALERT]
```

### Section Headers
Use `SCREAMING_SNAKE_CASE` for section headers within screens:
```
01. VISUAL_THEMES
02. SYSTEM_CONFIGURATION
```

### Debug/Settings Labels
Use Title Case for debug panel section headers:
```
Log Settings
Chat Settings
Audio Engine Diagnostics
```

## Abbreviations

### CommandStrip Labels (4 characters max)
| Screen | Label |
|--------|-------|
| logs | LOGS |
| deploy | PODS |
| chat | CHAT |
| tactical | TACT |
| map | MAP |
| burn | BURN |
| playbooks | LOAD |
| incidentPlaybook | PLAY |
| readout | READ |
| settings | CONF |
| howTo | HELP |

## Button Format

Use bracketed format with spaces for primary action buttons:
```
[ INITIALIZE_SESSION ]
[ SYSTEM_RESUME ]
[ ACKNOWLEDGE_AND_CLOSE ]
```

## Currency

Use locale-aware formatting via `Intl.NumberFormat`:
```typescript
new Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: 'USD', // or detect from locale
}).format(amount)
```

## Separators

| Context | Separator | Example |
|---------|-----------|---------|
| Status messages | `//` | `SYSTEM_LOCKED // AUTHORIZATION_PENDING` |
| Key-value pairs | `:` | `STATUS: NOMINAL` |
| Sentence endings | `.` | `SHUTDOWN COMPLETE.` |

## Content Width

Use character-based widths for readable text:

| Content Type | Width | Rationale |
|--------------|-------|-----------|
| Chat messages | 70ch | Conversational, shorter lines |
| Help/Documentation | 80ch | Slightly wider for docs |
| Playbook steps | 70ch | Step-by-step instructions |
| Technical content | 75ch | Standard technical docs |
| Terminal output | 100ch | Code/logs, wider acceptable |

### Mixin Usage
```scss
@import 'mixins';

.my-text-content {
  @include readable-text(70);
}
```

## Terminal Prompt

Use short format with operator name:
```
{operatorName}@SS:~$ 
```

Falls back to `OP@SS:~$ ` if no name is set.

## Confirmation Suffixes

| Operation Type | Suffix |
|----------------|--------|
| Successful operations | `[OK]` |
| State changes (severity, stack) | `[SUCCESS]` |
| Toggle on | `[ARMED]`, `[ACTIVE]`, `[ENABLED]` |
| Toggle off | `[DISARMED]`, `[INACTIVE]`, `[DISABLED]` |
| Errors | `[ERROR]`, `[FAILED]` |

## Command Descriptions

Use imperative voice for command descriptions:
```
Display incident response chat     (not: "Displays...")
Reset systems to nominal state     (not: "Resets..." or "System reset")
Enable slow burn protocol          (not: "Enables..." or "Slow burn enabling")
```

## Tone

### System Voice (Formal/Technical)
Use for:
- Status messages
- Error messages
- Command confirmations
- System labels

Example:
```
INCIDENT_ESCALATED: P1 [CRITICAL_ALERT]
SECURITY_OVERRIDE_TIMED_OUT. LOCKING_SYSTEM...
```

### Flavor Text (Casual/Humorous)
Acceptable in:
- MOTD (Message of the Day)
- Boot screen easter eggs
- Watercooler chat (NOMINAL state only)

Example:
```
IT'S ALWAYS DNS.
RETICULATING SPLINES...
```

Avoid in:
- Active incident communications
- Error messages
- Critical system status

## Version Strings

Use semantic versioning format: `vX.Y.Z`
```
SMOKESCREEN_OS v6.0.4
```

## Severity Levels

| Level | State | Description |
|-------|-------|-------------|
| NOMINAL | Green | All systems operational |
| P3 | Yellow | Degraded state |
| P1 | Orange | Critical alert |
| P0 | Red | Total system outage |
