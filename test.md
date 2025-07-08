# Fullstack Backend Engineer Evaluation Test

**(The duration of this test is **5 days**)**

**Dear participant**,

This is a comprehensive test to evaluate your backend engineering and real-world integration skills using modern tooling, clean architecture, and secure patterns.

---

## 🚫 **IMPORTANT RULE: NO AI-GENERATED CODE OR CONTENT**

**Do not use AI tools (such as ChatGPT, Copilot, Cursor, or Vibe Code) to write or generate your code or documentation.**  
You may use AI *very lightly* (for example, to look up a well-known snippet or clarify a concept), but it must not exceed **2% of your total work**.  
If you do use AI for any part, you must clearly indicate which part(s) were assisted.  
**Excessive use of AI is a disadvantage and will be noticed.**  
Thank you for respecting this rule and showing your authentic skills.

---

## Objective

You will build a **fullstack application** with authentication, real-time updates, and solid architecture using technologies like:

* **Next.js (App Router)** for frontend
* **Node.js with Express/NestJS** (your choice)
* **PostgreSQL**, **Redis**, **WebSockets**, and **Sessions** (no JWT)
* **TypeScript** throughout

---

## Project Overview: **Realtime Collaborative Comment System**

Users can:

* Register & log in securely (session-based auth)
* Post real-time collaborative text messages
* See who's writing in real-time and how many characters they wrote
* View a basic dashboard of active users

---

## Frontend Requirements

You will build a **Next.js 14+ App Router** frontend with:

### Authentication:

* Register and login via **email & password**
* Store auth using **secure sessions** (via cookies) — no JWT
* Display toast notifications (e.g., login success, invalid password)

### Stack:

* `shadcn/ui` for UI components
* `sonner` for notifications
* `Tailwind CSS` for styling
* `React Query` (TanStack Query) for data fetching
* `React Hook Form` + `Zod` for form validation
* `Jotai` or `React Context` for global auth/user state
* `WebSocket` (native or via Socket.IO) for real-time updates

---

## Backend Requirements

You may use **NestJS**, and your backend must support the frontend app and fulfill the following:

### 1. **Authentication (Session-based)**

Implement:

* `POST /auth/register`
* `POST /auth/login`
* `GET /auth/me`
* `POST /auth/logout`

Must use:

* Secure, **http-only session cookies**
* CSRF protection
* Password hashing (bcrypt)
* Session storage in **Redis**

### 2. **Realtime Collaboration**

Implement a **shared textarea** where:

* Users see **who is currently typing**
* See **live character count** per user
* Data is shared via **WebSocket**

Bonus:

* Display user’s **cursor position** (optional)
* Lockout if two users try to type on same line (super bonus)

### 3. **Message Storage & DB**

* Store all messages/comments in **PostgreSQL**
* Show latest messages via `GET /comments`
* Create messages via `POST /comments`
* Track: user ID, content, character count, timestamp

---

## System Features

### Caching:

* Use **Redis** to cache the `GET /comments` list for 10 seconds
* Invalidate on new message post

### Messaging:

* Use **RabbitMQ** (or Redis Pub/Sub) to publish events like:

  * `user.logged_in`
  * `comment.created`
* Log or process these events in a background worker

### Rate Limiting:

* Rate limit login and comment POST routes using IP
* Use Redis-based limiter

---

## Bonus Points

### Live Presence Indicator:

* Show:

  * "Ahmed is typing..."
  * Character count per user (real-time)
  * WebSocket payload should include `{ userId, name, charCount }`

### System Design:

* Provide a `SYSTEM.md` with:

  * Brief architecture diagram or bullet plan
  * Communication protocols used (REST vs WS)
  * Security precautions (e.g., session storage, CSRF, CORS, etc.)
  * How you'd scale this to 10K concurrent users

---

## Submission Guidelines

### 1. GitHub Repository

* You **must** create a **public GitHub repository** for your submission.
* Clearly state the **repository name** in your submission.
* Ensure the repository is public and contains all source code, documentation, and required files.

---

### 2. Repository Structure

* `/frontend`: Next.js frontend application
* `/backend`: Backend application (Express or NestJS)
* `/README.md`: Main project readme (see below)
* `/SYSTEM.md`: System design and scaling report (see below)

---

### 3. Documentation Requirements

#### a. `README.md`

* Must be written in Markdown.
* Include a brief project overview, setup instructions, and how to run both frontend and backend.
* Add any basic details needed to get started (e.g., prerequisites, environment setup, how to run locally, how to run tests).
* **Embed or link a raw, unedited, silent screen recording video** demonstrating the main features and usage of your app. The video should have no sound and should not be edited.
* Do **not** duplicate content from `SYSTEM.md`—keep system architecture and scaling details in `SYSTEM.md` only.

#### b. `SYSTEM.md`

* Must be written in Markdown.
* Include a brief architecture diagram or bullet-point plan.
* Describe communication protocols (REST, WebSocket, etc.).
* List security precautions (e.g., session storage, CSRF, CORS).
* Explain how you would scale the system to 10K+ concurrent users.

---

### 3. Optional Tests

* Add basic integration or unit tests using:

  * Frontend: `Vitest`, `React Testing Library`
  * Backend: `Vitest` or `Supertest` for REST endpoints

---

## Evaluation Criteria

| Category                            | Points |
| ----------------------------------- | ------ |
| Functional backend API              | 20     |
| Secure session-based auth           | 15     |
| Real-time collaboration (WS)        | 15     |
| Code structure & quality            | 15     |
| Redis caching & invalidation        | 10     |
| RabbitMQ pub/sub                    | 10     |
| Frontend architecture + integration | 10     |
| Bonus: Live typing meta, SYSTEM.md  | 5      |

---

## Tips

* Keep a `.env.example` for all env vars
* Use Docker Compose if possible for Redis/PostgreSQL
* Focus on correctness, security, and clarity over features

---
