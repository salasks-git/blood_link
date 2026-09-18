---
title: "LifeLink — Emergency Blood Donation Network"
subtitle: "Prototype / MVP Scope (Simplified)"
---

# LifeLink — Prototype Version

### Blood Donation Emergency Network — Minimal Build for Demo

---

## One-Line Pitch

**LifeLink connects people who need blood with nearby donors, through a hospital that verifies the request — with a basic admin layer for oversight.**

This version strips the idea down to what's needed for a working prototype demo: simple screens, core logic only, and no heavy security/infra work (noted separately as "future scope").

---

## Table of Contents

1. The 3 Core Roles (Admin kept minimal)
2. Basic Security (Prototype-Level Only)
3. Simplified System Flow
4. Donor-Finding Logic (Simplified)
5. Hospital Dashboard (Minimal)
6. Tech Stack (Prototype-Friendly)
7. MVP Feature List
8. Cut for Later (Future Scope)
9. Demo Script

---

# 1. The 3 Core Roles

For a prototype, keep roles simple — just enough to show the flow works end-to-end.

## Receiver
- Fills a short form: blood group, urgency, hospital name
- Sees a basic status: "Searching…" → "Donor found" → "Confirmed"
- No donor details shown (just distance, e.g. "3.2 km away")

## Hospital
- Logs in, sees incoming requests
- Can post a request manually too
- Confirms when a donor arrives, marks request complete

## Donor
- Registers once: blood group, availability toggle
- Gets a simple alert: "O+ needed — 3.2km away"
- Accepts / Declines

**Admin panel is optional for the prototype** — only include it if you want to demo "trust/oversight." For a first build, it can be a single simple screen (see Section 5).

---

# 2. Basic Security (Prototype-Level Only)

Full production security (2FA, encryption at rest, audit logging, DPDP compliance, etc.) is **not needed for a prototype** — mention it as a roadmap item, but don't build it yet.

For the demo, keep only:

| Feature | Why (Prototype Level) |
|---|---|
| Simple login (email/password or OTP mock) | Just enough to separate roles |
| Masked distance instead of exact location | Shows the privacy idea without real geolocation |
| No real contact info shown | Demonstrates the "two-key handshake" concept simply — can be a fake "Contact Unlocked" message |

**Future scope (mention in pitch, don't build):** OTP via SMS, 2FA for hospital/admin, encrypted storage, full audit trail, DPDP-style compliance.

---

# 3. Simplified System Flow

```
 Receiver ---> Hospital ---> Donor
    |             |             |
  creates      verifies     accepts
  request      request      request
    |             |             |
     -------> Status Updates <--
```

No need to diagram a full matching engine for a prototype — a simple "search donors → notify → accept → confirm" chain is enough to demo the idea.

---

# 4. Donor-Finding Logic (Simplified)

Skip the dynamic multi-ring radius expansion for the prototype — it's a nice detail for the pitch deck, but not needed to prove the concept works.

**Prototype version:**
1. Request posted with blood group + urgency
2. App checks a fixed list of seeded donors (e.g. 5–10 test accounts) matching blood group
3. Sends alert to all matching donors within a single fixed radius (e.g. 10km)
4. First donor to accept gets shown to hospital for confirmation

**Mention as future scope:** dynamic radius expansion by urgency (Critical/High/Normal), cooldown period tracking, blood bank fallback.

---

# 5. Hospital Dashboard (Minimal)

Just three screens needed:

1. **Home** — list of active requests (Blood Group, Urgency, Status)
2. **New Request** — simple form (Blood Group, Units, Urgency, Submit)
3. **Donor List** — basic table of seeded donors (Name, Blood Group, Available Y/N)

Skip for prototype: manual donor verification badges, live tracking animation, analytics/quick stats, manual call override.

**Optional Admin screen (if included):**
- One page: list of hospitals with an Approve/Reject button, and a list of users with a Suspend button. That's enough to demonstrate the "trust layer" concept.

---

# 6. Tech Stack (Prototype-Friendly)

| Layer | Prototype Choice |
|---|---|
| Frontend | Simple React app (or plain HTML/CSS/JS) |
| Backend | Lightweight — Node/Express, or even mocked JSON data (no real backend needed for a UI demo) |
| Database | Not required for UI prototype — hardcoded/mock data is fine; SQLite if you want it functional |
| Location | Fixed/fake distances instead of real GPS — no need for PostGIS/Redis Geo at this stage |
| Notifications | Simulated in-app alert (toast/banner) — no real SMS/push integration needed yet |
| Auth | Simple mock login — no real OTP/JWT needed for a demo |

**Future scope:** PostgreSQL + PostGIS, Redis Geo, Twilio + Firebase, JWT sessions, cloud hosting.

---

# 7. MVP Feature List

**Must-have for demo:**
- Receiver can create a request
- Hospital can see and confirm requests
- Donor can accept/decline a request
- Status updates visibly change (Searching → Found → Confirmed)
- Masked distance shown instead of exact location

**Nice-to-have if time allows:**
- Simple admin screen (approve hospital, suspend user)
- Basic donor history list

---

# 8. Cut for Later (Future Scope)

These are good talking points for "here's where this goes next," but skip them in the prototype build:

- Dynamic radius expansion logic by urgency
- Full RBAC + 2FA + JWT sessions
- Data encryption in transit/at rest
- Full audit trail & compliance (DPDP Act alignment)
- Fraud/dispute handling center
- Gamification (badges, streaks, leaderboard)
- Donor density heatmap
- Blood bank fallback suggestion
- Multi-language SMS templates
- Offline-first PWA support

---

# 9. Demo Script (Prototype Version)

1. **Receiver** submits a request for O+ blood
2. **Hospital dashboard** shows the new request appear
3. A **seeded donor account** receives a simple alert and accepts
4. **Hospital** confirms the donor
5. **Receiver's** status updates to "Donor found — Confirmed"
6. *(Optional)* **Admin screen** shown briefly to explain the oversight concept

That's enough to prove the core idea works — the rest can be described verbally as "planned next steps."

---

*This is a trimmed-down version of the original LifeLink concept, scoped specifically for a simple prototype/demo build.*