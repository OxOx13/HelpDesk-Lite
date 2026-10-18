# HelpDesk Lite 🎫

> 🌐 **Live Demo:** [https://helpdesk-lite-c34ef.web.app](https://helpdesk-lite-c34ef.web.app)

A fast, modern customer-support ticket management application built with **React**, **TypeScript**, **Vite**, and **vanilla CSS**.

HelpDesk Lite provides support agents with a dashboard to triage customer requests, log public replies and private internal notes, filter and sort ticket queues, and persist all state locally in the browser.

---

## Features

1. **Support Dashboard**
   - Live metrics summary displaying counts for **Total Volume**, **Open**, **In Progress**, and **Resolved** tickets.
   - Interactive metric cards that deep-link to filtered ticket views.
   - Urgency & priority distribution breakdown (High, Medium, Low).
   - Recent ticket activity feed with quick-action view buttons.

2. **Create Ticket Form**
   - Accessible modal dialog with focus trapping and `Escape` key support.
   - Collects customer name, customer email, issue subject, category (`Technical`, `Billing`, `General`, `Feature Request`, `Account`), and priority (`Low`, `Medium`, `High`).
   - Real-time inline field validation and error alerts.

3. **Ticket Queue with Search & Filters**
   - Search across Ticket ID, customer name, email address, subject line, and issue description.
   - Multi-dimensional filters: Status, Priority, and Category.
   - Flexible sorting: Newest First, Oldest First, Recently Updated, and Priority (High to Low / Low to High).
   - Responsive design: wide table for desktop screens and clean card layout for mobile viewports.
   - Clear empty states with quick-start actions.

4. **Ticket Detail & Conversation Thread**
   - Complete view of the customer inquiry, contact email, submission timestamp, and last activity time.
   - Interactive status dropdown switcher (`Open`, `In Progress`, `Resolved`) with instant updates.
   - Timestamped chronological conversation feed.

5. **Public Replies vs. Internal Notes**
   - **Public Customer Reply**: Teal styling, customer/agent avatars, intended for customer communication.
   - **Internal Note**: High-visibility warm amber theme with lock icons and labeled `Internal note — demo` to keep triage notes distinct from customer-facing messages.
   - Switchable composer tab allowing agents to post replies or save internal notes with optional status change on send and `Ctrl + Enter` keyboard shortcut.

6. **Robust LocalStorage Persistence**
   - All tickets and messages are persisted in `localStorage` under `helpdesk_lite_tickets_v1` and `helpdesk_lite_messages_v1`.
   - Schema validation upon loading that filters out corrupted records without crashing the application.
   - Catches browser storage errors (e.g., `QuotaExceededError` or private browsing restrictions) and displays non-intrusive warning/error banners.

7. **Safe, Non-Destructive Demo Data**
   - Clearly labeled **Load Demo Tickets** action in the sidebar and empty states.
   - Loads 6 realistic scenario tickets with sample conversation threads and internal notes.
   - **Guaranteed non-destructive**: never overwrites or resets your existing tickets or custom changes.

---

## Design System

- **Navy & Teal Palette**: Professional dark navy sidebar (`#0F172A`), teal action buttons and accents (`#0D9488`), and a crisp, light canvas (`#F8FAFC`, `#FFFFFF`).
- **Typography**: High-legibility typography with Plus Jakarta Sans and JetBrains Mono for ticket IDs.
- **Priority Badges**:
  - **High**: Soft rose/red background with alert badge.
  - **Medium**: Amber background with dash badge.
  - **Low**: Slate blue background with down-arrow badge.
- **Accessibility**: Semantic HTML5 elements (`<aside>`, `<main>`, `<nav>`, `<header>`, `<article>`), keyboard focus outlines, ARIA roles, live regions for alerts, and accessible form labels.

---

## Architecture & Data Model

### Data Model
```typescript
interface Ticket {
  id: string;              // e.g. "HD-1001", "HD-1002"
  customerName: string;    // Submitter's full name
  customerEmail: string;   // Submitter's email
  subject: string;         // Concise summary
  description: string;     // Initial inquiry details
  category: Category;      // 'Technical' | 'Billing' | 'General' | 'Feature Request' | 'Account'
  priority: Priority;      // 'Low' | 'Medium' | 'High'
  status: Status;          // 'Open' | 'In Progress' | 'Resolved'
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}

interface TicketMessage {
  id: string;              // Unique message identifier
  ticketId: string;        // Associated ticket ID
  type: MessageType;       // 'reply' | 'note'
  author: string;          // Name of the author (e.g. "Alex (Support Agent)")
  authorRole: AuthorRole;  // 'agent' | 'customer'
  body: string;            // Message text
  createdAt: string;       // ISO 8601 timestamp
}
```

### State Management
State is centralized using React Context (`TicketContext` and `useTickets` hook):
- **Lazy Initialization**: State is initialized synchronously on first mount via `useState(() => loadTicketsFromStorage())`, avoiding layout shifts or cascading re-renders.
- **Centralized Synchronization**: All ticket updates, status changes, new messages, and demo data imports flow through explicit context actions that write to `localStorage` and trigger reactive updates across all views.
- **Derived Metrics & Filtering**: Computes metrics and filtered ticket views with memoization (`useMemo`) to keep triage responsive.

---

## Verification & Quality Assurance

HelpDesk Lite has been thoroughly verified through both automated testing and end-to-end manual checks:

| Verification Stage | Details & Status |
|---|---|
| **Manual Verification** | Verified creating tickets, adding public replies and internal notes, updating statuses (`Open` → `In Progress` → `Resolved`), and confirming full state persistence after browser refresh. |
| **Automated Tests (`npm test`)** | Unit and integration suite covering ticket schema validation, message validation, non-destructive demo data merges, storage error classes, and multi-field search/filter/sort logic. |
| **Linting (`npm run lint`)** | Oxlint passes with **0 warnings and 0 errors**. |
| **TypeScript Compilation (`tsc -b`)** | Passes strict typecheck with **0 errors**. |
| **Production Build (`npm run build`)** | Vite production bundle compiles cleanly to `dist/` with optimized assets. |

---

## Setup & Running Instructions

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm

### Installation
```bash
# Clone or navigate to the project directory
cd helpdesk-lite

# Install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://127.0.0.1:5173/`.

### Run Tests & Quality Checks
```bash
# Run automated logic and integration tests
npm test

# Run Oxlint linter
npm run lint

# Compile production bundle
npm run build
```

### Production Preview
```bash
# Preview production build locally
npm run preview
```

---

## Firebase Hosting Configuration

HelpDesk Lite is configured for standard Firebase Hosting via `firebase.json`:
- **Public Directory**: `dist`
- **SPA Routing**: All paths rewrite to `/index.html`
- **Isolation**: Uses a separate Firebase project from ApplyTrack.

To deploy once your Firebase project is created:
```bash
# Log in to Firebase (requires interactive browser auth)
npx firebase-tools login

# Initialize/select your dedicated project (e.g. helpdesk-lite-demo)
npx firebase-tools use --add

# Deploy hosting
npx firebase-tools deploy --only hosting
```

---

## Prototype Scope & Limitations

HelpDesk Lite is designed as a **single-user local prototype**:
1. **Local Storage**: All tickets and messages are persisted in your browser's `localStorage`. Clearing browser data or using private/incognito mode without persistence will reset state.
2. **Simulated Communication**: Replies are stored in the local conversation thread; they do not send real outgoing emails via SMTP or external APIs.
3. **Internal Note Boundaries**: The distinction between public replies and internal notes is labeled `Internal note — demo` as a visual triage workflow distinction. In this local client prototype, all data resides in the user's browser without multi-tenant authentication, RBAC, or server-side security boundaries.
4. **Single-User Scope**: There is currently no multi-agent authentication, SSO, or backend database concurrency. Multiple open tabs share the local browser storage.
