# AI-Powered Incident Management Dashboard
## 1-Year Work Breakdown Structure (WBS) & Task Distribution Document

---

> **Document Type**: Agile Project Management — WBS & Sprint Plan  
> **Coverage**: 30 Operational Weeks (Full Academic Year)  
> **Academic Requirement**: Minimum 400 hours per student  
> **Team**: Kithsara (Dev/Backend), Chandupa (Dev/Frontend), Kasun (Dev/DevOps), Yoshadhi (QA), Vedeshen (BA)  
> **Prepared By**: Project Management Office  
> **Version**: 1.0

---

## Document Overview

This WBS maps every week of the academic year to specific, verifiable, high-effort technical and operational deliverables for each team member. The structure is designed to:

1. Satisfy individual 400-hour academic contribution requirements
2. Align 30 weeks with 30 mandatory Logbook entries
3. Produce industry-standard, examinable artifacts at each phase gate
4. Ensure no team member is idle — all tracks run in meaningful parallel

### Estimated Hours Per Week Per Member
- **Target**: ~14 hours/week/person → 420 hours over 30 weeks
- **Minimum**: 13.5 hours/week → 405 hours (safely above the 400-hour floor)

---

## Team Tracks at a Glance

| Member | Track | Core Technologies |
|--------|-------|------------------|
| **Kithsara** | Backend Architecture, REST APIs, Python AI Integration | Node.js/Express, PostgreSQL, FastAPI, scikit-learn, sentence-transformers |
| **Chandupa** | Frontend Architecture, React UI, Tailwind, Widget UI | React 18, TypeScript, Tailwind CSS, Recharts, D3.js |
| **Kasun** | DevOps, Core Backend Logic, Docker, CI/CD | Docker, Docker Compose, Nginx, GitHub Actions, Shell scripting |
| **Yoshadhi** | Test Planning, Test Cases, Unit/Integration Testing, AI Validation | Postman, Jest, Pytest, Newman, Cypress |
| **Vedeshen** | Requirements, Wireframing, User Stories, Data Seeding, Documentation | Figma, Draw.io, MS Word/LaTeX, SQL seed scripts |

---

## Phase Summary Table

| Phase | Weeks | Description | Key Deliverable |
|-------|-------|-------------|-----------------|
| **1A** | 1–4 | Requirements, Data Model, Wireframing | ERD, Wireframes, User Stories |
| **1B** | 5–12 | Core System (7 Objects) + Incident Register | Functional REST API + Basic UI |
| **1C** | 13–14 | Testing, Data Seeding, Phase 1 Deployment | Production-ready Phase 1 |
| **2A** | 15–18 | AI Architecture, Model Selection, AI Dashboard Wireframes | AI System Design Doc |
| **2B** | 19–28 | AI Model Development (NLP, K-Means, Risk), Widget Build | 3 Functional AI Widgets |
| **2C** | 29–30 | Integration Testing, Model Tuning, Final Deployment | Final Production System |

---

## ═══════════════════════════════════════════════════
## PHASE 1A — Requirements, Data Model & Wireframing
## Weeks 1–4
## ═══════════════════════════════════════════════════

---

### WEEK 1 — Project Kickoff & Environment Setup
**Logbook Theme**: *"Project Initiation: Environment Configuration and Role Alignment"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Set up local development environment: Node.js 20, PostgreSQL 16, Python 3.11, VS Code with extensions. 2. Create GitHub organisation and repository with branch protection rules (`main`, `dev`, `feature/*` strategy). 3. Scaffold initial Node.js/Express project structure (folders: routes, controllers, middleware, config). 4. Write and commit a `package.json` with core dependencies (express, cors, dotenv, bcryptjs, jsonwebtoken, prisma). 5. Draft the Database Connectivity Layer using `.env` configuration. | 14 hrs |
| **Chandupa** | 1. Set up React 18 + Vite + TypeScript project using `npm create vite@latest`. 2. Install and configure Tailwind CSS v3 with custom design tokens (colours, fonts, spacing). 3. Set up React Router v6 with placeholder pages: Login, Dashboard, Incidents, Create Incident. 4. Configure Axios with a base URL interceptor pointing to the backend. 5. Create shared layout components: Sidebar, TopNav, PageWrapper. | 14 hrs |
| **Kasun** | 1. Write the initial `docker-compose.yml` with three services: `postgres`, `backend`, `frontend`. 2. Write Dockerfiles for the backend (Node.js) and frontend (Vite dev server). 3. Verify all three containers start and communicate correctly. 4. Set up `.env.example` file with all required environment variable placeholders. 5. Document the local setup guide in `README.md` (how to clone, configure `.env`, and run `docker-compose up`). | 14 hrs |
| **Yoshadhi** | 1. Create the master Test Plan document outlining: scope, objectives, test environments, entry/exit criteria, and testing types (unit, integration, E2E). 2. Set up Postman workspace and create the first collection: "IMS Core API". 3. Write 10 foundational test cases for the Authentication module (register, login, invalid credentials, token expiry). 4. Research Jest configuration for Node.js unit testing and document the setup procedure. 5. Define the defect reporting template (severity, priority, steps to reproduce, expected vs actual). | 14 hrs |
| **Vedeshen** | 1. Facilitate the project kickoff meeting and produce formal Meeting Minutes. 2. Draft the initial Scope Statement document covering project objectives, boundaries, and exclusions. 3. Begin eliciting requirements through stakeholder interviews (simulated with team); produce a raw Requirements List (minimum 30 functional requirements). 4. Research incident management industry standards (ISO 45001, ITIL v4 incident categories) to inform domain vocabulary. 5. Create a Glossary of Terms document for the project. | 14 hrs |

**Phase 1A Week 1 Deliverables**: GitHub repo with branch structure, containerised skeleton app, initial test plan, scope statement, glossary.

---

### WEEK 2 — Requirements Finalisation & Data Modelling
**Logbook Theme**: *"Domain Analysis: Translating Requirements into a Relational Data Model"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Translate the 7 incident lifecycle objects into a formal Entity-Relationship Diagram (ERD) using draw.io or dbdiagram.io. 2. Write the complete PostgreSQL DDL script (`init.sql`) for all 9 tables (users, incidents, incident_actions, incident_investigations, incident_root_causes, incident_controls, incident_reviews, incident_closures, ai_embeddings). 3. Define all primary keys, foreign keys, constraints (`NOT NULL`, `CHECK`, `UNIQUE`), and `ON DELETE CASCADE` rules. 4. Enable `pgvector` extension in init.sql. 5. Apply the schema in the Docker PostgreSQL container and verify all tables are created successfully. | 14 hrs |
| **Chandupa** | 1. Design the global CSS design system in `index.css`: CSS custom properties for colours (primary, secondary, accent, surface, text), typography scale, spacing scale, and border-radius tokens. 2. Build the `Button` component in 4 variants: primary, secondary, ghost, danger — with hover/focus/disabled states. 3. Build the `Input` component with label, helper text, and error state. 4. Build the `Card` component with header, body, and footer slots. 5. Implement a `Badge` component for severity indicators (LOW=green, MEDIUM=yellow, HIGH=orange, CRITICAL=red). | 14 hrs |
| **Kasun** | 1. Research and implement GitHub Actions CI pipeline: on every push to `dev`, run `npm install` and placeholder linting. 2. Add a health check endpoint (`GET /api/health`) to the Express backend and verify Docker healthcheck works. 3. Write the `docker-compose.override.yml` for development mode (bind mounts for hot reload). 4. Implement Nginx configuration as a reverse proxy routing `/api` → backend and `/` → frontend. 5. Document the CI/CD pipeline architecture in a `DEVOPS.md` file. | 14 hrs |
| **Yoshadhi** | 1. Review the ERD produced by Kithsara and write 15 data integrity test cases (e.g., "Creating an incident_action without a valid incident_id should fail with FK violation"). 2. Create the Test Case Template spreadsheet with columns: TC_ID, Description, Preconditions, Steps, Expected Result, Actual Result, Status, Assigned To. 3. Write 10 test cases for the Incident Details (Object 1) CRUD operations. 4. Set up Postman Environment variables (base_url, auth_token) for the test collection. 5. Create a test data set: 5 sample incidents in JSON format for API testing. | 14 hrs |
| **Vedeshen** | 1. Convert the raw requirements list into formal User Stories using the format: "As a [role], I want to [action], so that [benefit]." Produce minimum 25 user stories. 2. Prioritise user stories using MoSCoW method (Must-have, Should-have, Could-have, Won't-have). 3. Create the Sprint Backlog in a task tracking tool (GitHub Projects or Trello). 4. Produce the first set of low-fidelity wireframes for: Login page, Dashboard overview, and the Incident Register list view. 5. Document the data dictionary: each table's columns, data types, and business meaning. | 14 hrs |

**Phase 1A Week 2 Deliverables**: Complete ERD, DDL init.sql, 25 User Stories (MoSCoW-prioritised), component library foundations, CI pipeline.

---

### WEEK 3 — Wireframing, API Contract Design & Auth Implementation
**Logbook Theme**: *"Design Specification: Wireframes, API Contracts, and Authentication Foundation"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Design and document the full REST API Contract for Phase 1 in a shared `API_SPEC.md` file: all endpoints, HTTP methods, request bodies, response schemas, and status codes. 2. Implement JWT Authentication: `POST /api/auth/register` and `POST /api/auth/login` with bcrypt password hashing. 3. Write the `authenticate` JWT middleware and apply it to all protected routes. 4. Implement token refresh logic (`POST /api/auth/refresh`). 5. Write manual tests in Postman to verify Auth flow end-to-end. | 14 hrs |
| **Chandupa** | 1. Build the Login page with form validation (email format, password minimum length). 2. Implement the Auth Context in React using `useContext` and `useReducer` to manage JWT tokens in localStorage. 3. Create the Protected Route component that redirects unauthenticated users to Login. 4. Build the Dashboard skeleton page with a sidebar navigation listing: Dashboard, Incidents, Reports, Settings. 5. Implement an Axios request interceptor that automatically attaches the `Authorization: Bearer <token>` header to all API calls. | 14 hrs |
| **Kasun** | 1. Add PostgreSQL data persistence volume to `docker-compose.yml` and verify data survives container restarts. 2. Configure environment-specific builds: `docker-compose.prod.yml` for production (no bind mounts, production NODE_ENV). 3. Implement a database migration strategy using Prisma Migrate: run `prisma migrate dev` inside the container and document the procedure. 4. Write a shell script (`scripts/seed.sh`) that runs the initial seed SQL inside Docker. 5. Set up log aggregation: configure Docker to write container logs to a local `logs/` directory. | 14 hrs |
| **Yoshadhi** | 1. Write 20 detailed test cases for the Authentication API (register, login, token validation, duplicate email rejection, wrong password, missing fields). 2. Execute the Auth test cases against the live backend and log results. 3. Create a Bug Report for any failures found. 4. Set up Jest in the backend project and write the first 3 unit tests for the password hashing utility function. 5. Document the Testing Environment setup guide (how to configure Postman, run Jest). | 14 hrs |
| **Vedeshen** | 1. Produce medium-fidelity wireframes in Figma for: Create Incident form (multi-step wizard, all 7 objects), Incident Detail view, and Incident Register table. 2. Annotate each wireframe with field labels, validation rules, and interaction notes. 3. Write the formal Software Requirements Specification (SRS) document — Section 1 (Introduction) and Section 2 (Overall Description). 4. Create the first draft of the Data Seeding Strategy document: how many synthetic incidents are needed, what realistic data looks like per field. 5. Produce User Story acceptance criteria for the first 10 Must-have stories. | 14 hrs |

**Phase 1A Week 3 Deliverables**: Full API contract spec, working Auth API, Login UI, Figma wireframes (all 7 objects), SRS Sections 1–2.

---

### WEEK 4 — Architecture Review, Prisma Setup & Wireframe Sign-off
**Logbook Theme**: *"Design Freeze: Architecture Validation and Phase 1A Gate Review"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Set up Prisma ORM: write `schema.prisma` mapping all 9 tables with full relation definitions. 2. Run `prisma migrate dev --name init` to generate the first migration file. 3. Create the `prisma/seed.js` script to insert 3 sample users (admin, manager, staff) and 2 sample incidents for development. 4. Build the shared `db.js` Prisma client singleton and test connectivity. 5. Conduct a solo architecture review: trace a complete request from HTTP to DB and back, documenting any gaps. | 14 hrs |
| **Chandupa** | 1. Implement the multi-step Incident form wizard skeleton: step indicator UI (7 steps), Next/Back navigation, and form state persistence across steps using React state. 2. Build the Incident Register table page: a data table component with sortable columns (ID, Title, Severity, Status, Date, Reporter). 3. Implement pagination UI on the Incident Register (page 1 of N, next/prev buttons). 4. Create the `Severity Badge` and `Status Badge` components used throughout the table. 5. Wire the Login form to the real Auth API and test the full login flow. | 14 hrs |
| **Kasun** | 1. Run Prisma migrations inside Docker and verify the schema is applied correctly. 2. Write a `Makefile` with shortcuts: `make up`, `make down`, `make seed`, `make migrate`, `make logs`. 3. Implement the GitHub Actions workflow: on PR to `main`, run automated linting and Jest tests. 4. Write a container startup health check script that waits for PostgreSQL to be ready before starting the backend. 5. Document the full DevOps architecture in a formal `ARCHITECTURE.md` document with a deployment diagram. | 14 hrs |
| **Yoshadhi** | 1. Perform a walkthrough review of all Figma wireframes and raise UI/UX concerns as formal review comments. 2. Write acceptance test cases for each of the 7 incident lifecycle steps (minimum 5 test cases per object = 35 test cases total — establish all, verify over coming weeks). 3. Update the Postman collection with Auth token variables that auto-refresh. 4. Write 5 Jest unit tests for the input validation/sanitisation utility. 5. Produce the Phase 1A QA Summary Report: what was tested, pass rate, open bugs. | 14 hrs |
| **Vedeshen** | 1. Complete SRS Sections 3 (Functional Requirements) and 4 (Non-Functional Requirements — performance, security, usability). 2. Facilitate the Phase 1A Gate Review meeting: present wireframes, ERD, and API spec for team approval. Produce formal meeting minutes and sign-off record. 3. Finalise and freeze the wireframes in Figma (no further structural changes after this point). 4. Create the Traceability Matrix v1: mapping each User Story to its ERD entity, API endpoint, and wireframe screen. 5. Begin drafting the Data Seeding SQL scripts for the `users` and `incidents` tables (produce 20 realistic sample records). | 14 hrs |

**Phase 1A Week 4 Deliverables**: Prisma schema + first migration, multi-step form skeleton, SRS complete, wireframes frozen, Phase 1A gate review completed and signed off.

---

## ═══════════════════════════════════════════════════
## PHASE 1B — Core System Development (7 Objects)
## Weeks 5–12
## ═══════════════════════════════════════════════════

---

### WEEK 5 — Object 1: Incident Details API & UI
**Logbook Theme**: *"Core Development Sprint 1: Incident Details — The Foundational Object"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `POST /api/incidents` — create new incident with full validation (title min 5 chars, severity enum, category required). 2. Implement `GET /api/incidents` — paginated list with filters (status, severity, date range, reporter). 3. Implement `GET /api/incidents/:id` — full incident record including all related objects. 4. Implement `PUT /api/incidents/:id` — update incident details. 5. Write input validation middleware using Joi or Zod for all Incident Detail fields. | 14 hrs |
| **Chandupa** | 1. Build Step 1 of the multi-step form: Incident Details fields (title, description, severity select, category, location, department). 2. Implement real-time client-side validation with error messages beneath each field. 3. On form submission, call `POST /api/incidents` and store returned `incident_id` in React state. 4. Build the Incident Detail view page: display all fields with a read-only card layout. 5. Implement the "Edit" button that switches the detail view to an editable form. | 14 hrs |
| **Kasun** | 1. Implement the `GET /api/incidents` route's query parameter parsing for filtering and sorting in the Express controller. 2. Add database indexes to the `incidents` table: index on `status`, `severity`, `created_at`, `reported_by`. 3. Write a SQL performance analysis: use `EXPLAIN ANALYZE` on the list query and document the results. 4. Implement request rate limiting using `express-rate-limit` to prevent API abuse. 5. Add request logging middleware using `morgan` and configure log rotation. | 14 hrs |
| **Yoshadhi** | 1. Write and execute 20 test cases for `POST /api/incidents`: valid payloads, all required field variations, invalid enum values, duplicate detection. 2. Write 10 test cases for `GET /api/incidents`: pagination (page=1, page=5, limit=10, limit=100), filter combinations. 3. Execute all test cases in Postman and log results. 4. Write 3 Jest unit tests for the Incident Details validation middleware. 5. Log all bugs found to the GitHub Issues tracker with appropriate labels. | 14 hrs |
| **Vedeshen** | 1. Complete the Data Seeding SQL for the `incidents` table: write 50 realistic incident records covering all severity levels, categories, and departments. 2. Write the user acceptance criteria for User Stories: UC-001 (Create Incident), UC-002 (View Incident Register), UC-003 (Filter Incidents). 3. Update the Traceability Matrix with Object 1 API endpoints and UI screens. 4. Write the Logbook Entry 5 template for the team (problem encountered, solution, evidence). 5. Produce the first weekly Status Report for the project. | 14 hrs |

---

### WEEK 6 — Object 2: Actions & Object 3: Investigation APIs & UI
**Logbook Theme**: *"Core Development Sprint 2: Response Actions and Investigation Modules"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `POST /api/incidents/:id/actions` — create action record (action_taken, assigned_to, priority, due_date). 2. Implement `GET /api/incidents/:id/actions` — list all actions for an incident. 3. Implement `PUT /api/incidents/:id/actions/:actionId` — update action status (PENDING → IN_PROGRESS → COMPLETED). 4. Implement `POST /api/incidents/:id/investigation` — create investigation record. 5. Implement `GET /api/incidents/:id/investigation` — retrieve investigation with joined investigator user details. | 14 hrs |
| **Chandupa** | 1. Build Step 2 of the multi-step form: Actions sub-form with an "Add Action" repeater (dynamically add multiple action rows, each with assigned_to, priority, due_date fields). 2. Build Step 3: Investigation form (findings textarea, evidence textarea, investigation date picker, investigator dropdown). 3. Implement the Action Status tracker UI in the Incident Detail view (list of actions with inline status toggle buttons). 4. Build a `DatePicker` component wrapping a native HTML date input with custom Tailwind styling. 5. Implement a `UserSelector` dropdown that fetches the users list from `GET /api/users` and displays names. | 14 hrs |
| **Kasun** | 1. Implement bulk action status update: `PATCH /api/incidents/:id/actions/bulk-status`. 2. Write database migration for any schema corrections identified during Week 5 development. 3. Add cascade delete testing: verify deleting an incident removes all child records (actions, investigation, etc.). 4. Implement API response compression using `compression` middleware. 5. Add `helmet.js` security headers to the Express app and document what each header protects against. | 14 hrs |
| **Yoshadhi** | 1. Write 15 test cases for Actions API (create, list, update status, invalid incident_id, missing required fields). 2. Write 15 test cases for Investigation API. 3. Create a Postman test collection runner configuration (Newman) so tests can be run from the command line. 4. Write 5 Jest unit tests for the action status state machine (PENDING → IN_PROGRESS, IN_PROGRESS → COMPLETED, invalid transitions). 5. Update the Bug Report log and close resolved issues. | 14 hrs |
| **Vedeshen** | 1. Write seeding SQL for `incident_actions` and `incident_investigations` tables (50 records each, linked to seeded incidents). 2. Update user stories with acceptance criteria for UC-004 (Add Action), UC-005 (Track Action Status), UC-006 (Record Investigation). 3. Produce mid-week progress update for the team (what's done, what's blocked, what's next). 4. Begin drafting Section 5 of the SRS: "External Interface Requirements" (UI screens, API contracts). 5. Update the Traceability Matrix for Objects 2 and 3. | 14 hrs |

---

### WEEK 7 — Object 4: Root Cause & Object 5: Controls APIs & UI
**Logbook Theme**: *"Core Development Sprint 3: Root Cause Analysis and Control Measures"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `POST /api/incidents/:id/root-cause` with fields: root_cause_category (enum: Human Error, System Failure, Process Gap, External), description, contributing_factors, causal_chain. 2. Implement `GET /api/incidents/:id/root-cause`. 3. Implement `PUT /api/incidents/:id/root-cause` (update/amend root cause). 4. Implement `POST /api/incidents/:id/controls` with fields: control_type (Preventive/Detective/Corrective), description, owner, implementation_date, status. 5. Implement `GET /api/incidents/:id/controls` — list all controls for an incident. | 14 hrs |
| **Chandupa** | 1. Build Step 4 of the multi-step form: Root Cause Analysis panel — category dropdown (Human Error, System Failure, Process Gap, External), rich description textarea, contributing factors checklist, causal chain text area. 2. Build Step 5: Controls form with an "Add Control" repeater pattern similar to Actions. 3. Implement a `RadioGroup` component for the root_cause_category field with custom Tailwind styling. 4. Implement a `CheckboxGroup` component for contributing factors (multi-select). 5. Build the "Root Cause" card in the Incident Detail view with all fields displayed in a structured layout. | 14 hrs |
| **Kasun** | 1. Implement a background status update job: a scheduled task (using `node-cron`) that checks for overdue actions (past due_date and status != COMPLETED) and marks them as OVERDUE. 2. Add a `GET /api/incidents/:id/status-summary` endpoint returning counts of all sub-objects (actions: 3 total, 1 completed, etc.). 3. Write integration tests at the Docker level: verify that the backend container connects to the PostgreSQL container on startup. 4. Implement API versioning prefix (`/api/v1/`) and update all routes. 5. Add CORS configuration restricting to only the frontend's origin in production. | 14 hrs |
| **Yoshadhi** | 1. Write 15 test cases for Root Cause API (valid categories, boundary testing on text lengths, update idempotency). 2. Write 15 test cases for Controls API (create, list, status update, owner validation). 3. Write a full integration test flow in Postman: create incident → add action → add investigation → add root cause → add controls (chain all 5 steps in a single Postman collection run). 4. Write 5 Jest unit tests for the root cause category enum validator. 5. Produce the Week 7 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Write seeding SQL for `incident_root_causes` and `incident_controls` tables (50 records each). 2. Research the "5 Whys" and "Fishbone Diagram" root cause analysis methodologies and write a 2-page summary for the project report. 3. Update user stories: UC-007 (Record Root Cause), UC-008 (Add Controls), UC-009 (Assign Control Owner). 4. Update Traceability Matrix for Objects 4 and 5. 5. Produce weekly status report and update the Sprint Backlog. | 14 hrs |

---

### WEEK 8 — Object 6: Review & Object 7: Close APIs & UI
**Logbook Theme**: *"Core Development Sprint 4: Management Review and Incident Closure"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `POST /api/incidents/:id/review` with fields: reviewer_id, review_notes, effectiveness_rating (1–5), review_date. 2. Implement `GET /api/incidents/:id/review`. 3. Implement `POST /api/incidents/:id/close` with fields: closure_summary, lessons_learned, closed_by, closure_date. 4. Implement status transition enforcement: close endpoint must reject if review has not been completed first (return 422 with descriptive error). 5. Implement `GET /api/incidents/:id/close`. | 14 hrs |
| **Chandupa** | 1. Build Step 6: Review form — reviewer selector, star rating component (1–5 effectiveness), review notes, review date. 2. Build Step 7: Close Incident form — closure summary, lessons learned textarea, closure date. 3. Build the `StarRating` component with hover and click interactivity in Tailwind. 4. Implement the "Incident Lifecycle Progress Bar" in the Incident Detail view: a visual horizontal stepper showing which of the 7 objects are complete (green check) vs outstanding (grey circle). 5. Implement a confirmation modal ("Are you sure you want to close this incident?") before submitting the close form. | 14 hrs |
| **Kasun** | 1. Implement the full incident status state machine in the backend: OPEN → IN_PROGRESS → UNDER_REVIEW → CLOSED. Enforce state transitions at the API level. 2. Write the status transition table in `ARCHITECTURE.md`. 3. Add a `GET /api/incidents/stats` endpoint returning: total incidents, open count, closed count, breakdown by severity, average time to close. 4. Implement DB connection pooling configuration in Prisma and document the settings. 5. Write a Docker health check for the backend: curl the health endpoint every 30 seconds. | 14 hrs |
| **Yoshadhi** | 1. Write 15 test cases for Review API. 2. Write 20 test cases for Close API: valid closure, closure without prior review (expect 422), double-closure attempt (expect 409), closure date in the past. 3. Execute the complete 7-step incident lifecycle integration test in Postman and document results. 4. Test the status state machine: attempt out-of-order transitions and verify rejection. 5. Write the integration test report for the full Phase 1B lifecycle. | 14 hrs |
| **Vedeshen** | 1. Write seeding SQL for `incident_reviews` and `incident_closures` tables (50 records each — creating 50 fully-closed incidents end-to-end for AI training data later). 2. Draft lessons_learned content for all 50 seeded closed incidents (realistic text). 3. Update user stories: UC-010 (Review Incident), UC-011 (Close Incident), UC-012 (View Lifecycle Progress). 4. Write the Process Flow Diagram for the 7-object lifecycle (swim-lane diagram showing who does what at each step). 5. Update Traceability Matrix for Objects 6 and 7. | 14 hrs |

---

### WEEK 9 — Incident Register, Dashboard Overview & User Management
**Logbook Theme**: *"System Integration: Incident Register, Dashboard Metrics, and User Roles"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `GET /api/users` (admin only) — list all users with roles. 2. Implement `POST /api/users` (admin only) — create user with role assignment. 3. Implement `PUT /api/users/:id/role` — update user role. 4. Implement Role-Based Access Control (RBAC) middleware: admin, manager, staff roles with route-level guards. 5. Implement `GET /api/incidents/stats` — dashboard statistics aggregation query using Prisma. | 14 hrs |
| **Chandupa** | 1. Build the Dashboard Overview page: display 4 KPI cards (Total Incidents, Open, In-Progress, Closed) with animated count-up numbers. 2. Build a Severity Distribution bar chart using Recharts (`BarChart`). 3. Build a Status Breakdown pie chart using Recharts (`PieChart`). 4. Build the "Recent Incidents" table showing last 10 incidents with clickable rows. 5. Implement auto-refresh of dashboard data every 60 seconds using `setInterval`. | 14 hrs |
| **Kasun** | 1. Implement RBAC middleware integration test: verify admin routes reject staff tokens. 2. Set up Redis container in docker-compose for caching the dashboard stats endpoint (cache for 5 minutes). 3. Write a `GET /api/health/detailed` endpoint returning DB connection status, Redis status, and uptime. 4. Implement request body size limits (prevent large payload attacks). 5. Write a `scripts/reset-db.sh` script that drops and recreates the schema — useful for testing. | 14 hrs |
| **Yoshadhi** | 1. Write 20 test cases for RBAC: each role (admin, manager, staff) accessing each protected route. 2. Write 10 test cases for Dashboard Stats API: verify correct counts. 3. Test the complete Incident Register page for UI correctness: pagination, sorting, filtering with correct data displayed. 4. Write 5 Jest unit tests for the RBAC middleware. 5. Produce the Week 9 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Finalise the complete seeded dataset: all 50 incidents fully populated across all 7 object tables. Review for realistic data quality. 2. Write the User Role Matrix: what each role (admin, manager, staff) can and cannot do per object. 3. Write acceptance criteria for UC-013 (User Management), UC-014 (View Dashboard Stats), UC-015 (RBAC enforcement). 4. Update the SRS with the RBAC section. 5. Produce a mid-project status report with % completion of Phase 1B. | 14 hrs |

---

### WEEK 10 — Search, Filtering, Pagination & Notifications
**Logbook Theme**: *"UX Enhancement: Advanced Search, Filtering, and User Notifications"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement advanced search on `GET /api/incidents`: full-text search on `title` and `description` using PostgreSQL `ILIKE` or `to_tsvector`. 2. Add compound filtering: filter by severity AND status AND date range AND reporter simultaneously. 3. Implement `GET /api/incidents/export` — export filtered incidents as CSV (using the `json2csv` library). 4. Implement `GET /api/incidents/:id/timeline` — chronological event log of all changes to an incident. 5. Implement soft delete: `DELETE /api/incidents/:id` sets `deleted_at` timestamp rather than removing the record. | 14 hrs |
| **Chandupa** | 1. Build an advanced search bar component at the top of the Incident Register: live search input that debounces API calls (300ms delay) using `lodash.debounce`. 2. Build a Filter Panel: collapsible sidebar with checkboxes for severity, status, and a date range picker for created_at. 3. Implement the CSV export button that calls the export endpoint and triggers a browser download. 4. Build the Incident Timeline component in the detail view: a vertical timeline (list of events with timestamps and actors). 5. Build an in-app Toast notification system for success/error feedback (custom hook `useToast`). | 14 hrs |
| **Kasun** | 1. Implement PostgreSQL full-text search index: `CREATE INDEX incidents_fts ON incidents USING GIN(to_tsvector('english', title || ' ' || description))`. 2. Write query performance tests: benchmark list queries before and after the GIN index. 3. Implement the CSV export as a streaming response to handle large datasets without memory issues. 4. Add input sanitisation against SQL injection (verify Prisma parameterized queries). 5. Write automated backup script: `scripts/backup-db.sh` that dumps PostgreSQL to a `.sql.gz` file. | 14 hrs |
| **Yoshadhi** | 1. Write 20 test cases for the advanced search (keyword matches title, matches description, no results case, special characters). 2. Write 10 test cases for compound filtering combinations. 3. Test the CSV export: verify column headers, data accuracy, and encoding. 4. Test the soft delete: verify deleted incidents don't appear in list but are retrievable with `?include_deleted=true`. 5. Write 5 Jest unit tests for the CSV conversion utility. | 14 hrs |
| **Vedeshen** | 1. Write the Seeding Data Quality Review document: analyse the 50 seeded incidents for realistic distribution (are severity levels balanced? Are categories diverse?). 2. Augment the seed data if distribution is poor: add 20 more incidents to balance categories. 3. Write user stories: UC-016 (Search Incidents), UC-017 (Filter Incidents), UC-018 (Export Incidents to CSV). 4. Update Traceability Matrix. 5. Update project risk register: log any identified risks and proposed mitigations. | 14 hrs |

---

### WEEK 11 — Settings, Profile Management & UI Polish
**Logbook Theme**: *"System Completeness: Settings Module, Profile Management, and UI Refinement"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `GET /api/users/me` — current user's profile. 2. Implement `PUT /api/users/me` — update own profile (name, email). 3. Implement `PUT /api/users/me/password` — change password (verify old password, hash new). 4. Implement audit logging: a database table `audit_logs` that records: user_id, action, entity_type, entity_id, timestamp, IP address. 5. Write a middleware that automatically creates an audit log entry for every mutating API call (POST, PUT, DELETE). | 14 hrs |
| **Chandupa** | 1. Build the User Profile page: display user info, allow editing name/email with inline edit pattern. 2. Build the Change Password form with current password, new password, confirm new password fields and strength indicator. 3. Polish the multi-step incident form: add smooth CSS transition animations between steps (slide-in effect). 4. Implement empty state illustrations for the Incident Register when no incidents match the filter. 5. Implement a responsive mobile breakpoint for all pages (Tailwind `md:`, `lg:` classes for tablet and desktop layout). | 14 hrs |
| **Kasun** | 1. Create the `audit_logs` table migration and index on `user_id` and `created_at`. 2. Implement `GET /api/audit-logs` (admin only) — paginated audit log viewer. 3. Write a Docker Compose profile: `docker-compose --profile dev up` for development with pgAdmin UI container. 4. Configure pgAdmin in Docker for visual DB management during development. 5. Write a performance baseline document: record response times for all major endpoints at current data volume (50 records). | 14 hrs |
| **Yoshadhi** | 1. Write 15 test cases for Profile Management API (get own profile, update name, update email, change password successfully, change password with wrong current password). 2. Write 10 test cases for Audit Log API (admin can view, staff cannot view, logs are created on mutations). 3. Verify audit logs are being created correctly for all 7 incident object endpoints. 4. Perform UI testing checklist on the multi-step form in the browser (all fields validate, navigation works). 5. Produce the Week 11 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Create the final complete seeding script `seed_phase1.sql` that seeds all 9 tables (50 closed incidents + supporting records). 2. Write the Project Report — Chapter 1: Introduction (background, problem statement, objectives, scope). 3. Write the Project Report — Chapter 2: Literature Review (Incident Management systems, existing tools like ServiceNow/Jira, gap analysis). 4. Capture and organise all Figma wireframe screenshots for the project report appendix. 5. Update the Traceability Matrix to 100% coverage for Phase 1B. | 14 hrs |

---

### WEEK 12 — Phase 1B Integration, Bug Fixing & Pre-Testing Hardening
**Logbook Theme**: *"Phase 1B Completion: Full System Integration and Pre-Deployment Hardening"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Perform a complete end-to-end API walkthrough: trace one incident from creation through all 7 objects to closure, fixing any discovered API bugs. 2. Implement global error handling middleware: catch unhandled errors, return consistent JSON error responses, and log errors. 3. Write API documentation using Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`) — document all Phase 1 endpoints. 4. Implement input sanitization: strip HTML tags from text inputs using `sanitize-html`. 5. Fix all open backend bugs from the GitHub Issues tracker. | 14 hrs |
| **Chandupa** | 1. Implement the full multi-step form end-to-end: ensure all 7 steps submit to the correct APIs using the `incident_id` from Step 1. 2. Fix all frontend UI bugs identified in QA testing. 3. Implement loading skeleton screens for data-fetching states (Incident Register, Incident Detail). 4. Add error boundary components to catch and display React render errors gracefully. 5. Perform cross-browser compatibility check: test in Chrome, Firefox, and Edge; fix any inconsistencies. | 14 hrs |
| **Kasun** | 1. Implement a production-ready `docker-compose.prod.yml`: no source code mounts, environment variables from `.env.prod`, restart policies (`unless-stopped`). 2. Write the automated test runner script: `scripts/run-tests.sh` that runs Jest (backend unit tests) and Newman (API integration tests) in sequence. 3. Configure Nginx in the production Docker setup to serve the built React static files. 4. Write a pre-deployment checklist document. 5. Test the full production Docker build from scratch on a clean environment. | 14 hrs |
| **Yoshadhi** | 1. Execute the complete Phase 1B regression test suite (all accumulated test cases). 2. Perform exploratory testing on the full UI: discover edge cases not covered by written test cases. 3. Test the Swagger documentation: verify all documented endpoints work as described. 4. Produce the Phase 1B Test Completion Report: total test cases, pass rate, defect density, open bugs. 5. Write the Go/No-Go recommendation for Phase 1C (Deploy to Production). | 14 hrs |
| **Vedeshen** | 1. Write the Project Report — Chapter 3: System Design (architecture overview, ERD, API design, technology justification). 2. Run a spell-check and formatting review on all documentation produced so far. 3. Produce the Phase 1B Completion Summary for the academic supervisor (what was built, evidence of completion, screenshots). 4. Update the Sprint Backlog: close all Phase 1B items, create Phase 1C sprint. 5. Conduct a lessons-learned session with the team and document key insights. | 14 hrs |

---

## ═══════════════════════════════════════════════════
## PHASE 1C — Testing, Data Seeding & Production Deployment
## Weeks 13–14
## ═══════════════════════════════════════════════════

---

### WEEK 13 — Comprehensive Testing & Data Seeding Execution
**Logbook Theme**: *"Phase 1C: Full System Test Execution and Synthetic Data Population"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Fix all bugs raised in the Phase 1B Test Completion Report (prioritised by severity). 2. Implement missing edge case handling discovered during regression testing. 3. Optimise the N+1 query problem in `GET /api/incidents/:id` by using Prisma's `include` for eager loading all 7 objects in one query. 4. Write 10 additional Pytest tests for backend utility functions. 5. Review and merge all outstanding feature branches into `dev`. | 14 hrs |
| **Chandupa** | 1. Fix all frontend bugs from QA regression testing. 2. Implement the final responsive layout corrections for mobile screens. 3. Polish animation transitions: ensure all page transitions and modal animations are smooth and consistent. 4. Implement print stylesheet for Incident Detail view (for formal incident reports). 5. Conduct a final UI self-review against the Figma wireframes — document any deviations with justification. | 14 hrs |
| **Kasun** | 1. Execute the `seed_phase1.sql` on the production PostgreSQL container and verify all 50 fully-closed incidents are present. 2. Run the automated test suite (`scripts/run-tests.sh`) against the production-built containers and document pass/fail. 3. Implement HTTPS in the Nginx configuration using a self-signed certificate (for demo purposes). 4. Write the Production Deployment Runbook: step-by-step instructions for deploying to any server. 5. Perform a destructive test: bring down the PostgreSQL container, restart it, and verify data integrity. | 14 hrs |
| **Yoshadhi** | 1. Execute the full regression test suite against the production build (not development). 2. Perform User Acceptance Testing (UAT) simulation: walk through all user stories as an end user and verify each acceptance criterion. 3. Verify the seeded data displays correctly in the UI (Incident Register shows 50 records, filters work, details show all 7 objects). 4. Test the CSV export with the full 50-record dataset. 5. Produce the Phase 1C UAT Report. | 14 hrs |
| **Vedeshen** | 1. Review all 50 seeded incidents for content quality: realistic titles, descriptions, root causes, and lessons learned (edit any that are implausible). 2. Write the Data Seeding Strategy document: the methodology, tool used, realistic data generation approach, and data distribution analysis. 3. Update the Project Report with Phase 1C testing results summary. 4. Write the Phase 1C Deployment Evidence document (screenshots of production system). 5. Update the Traceability Matrix to confirm all Phase 1 requirements are tested and met. | 14 hrs |

---

### WEEK 14 — Production Deployment, Phase 1 Demo & Phase 2 Planning
**Logbook Theme**: *"Phase 1 Gate: Production Release and Phase 2 Architecture Planning Begins"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Perform the final production deployment: tag the `v1.0.0` release in Git and deploy. 2. Verify all API endpoints are operational in the production environment. 3. Begin reading FastAPI documentation and sentence-transformers documentation for Phase 2 preparation. 4. Design the initial architecture for the AI microservice: folder structure, dependency list, database connectivity approach. 5. Write a short "Phase 1 Technical Retrospective" document: what went well, what to improve in the backend for Phase 2. | 14 hrs |
| **Chandupa** | 1. Perform the final production deployment for the frontend (build React app, serve via Nginx). 2. Verify all UI features work correctly in production. 3. Begin reading Recharts and D3.js documentation for the AI dashboard widgets. 4. Sketch rough UI concepts for the 3 AI widget cards (Similar Incidents, Cluster Map, Risk Score). 5. Write a "Phase 1 Frontend Retrospective": component patterns that worked well, technical debt to address. | 14 hrs |
| **Kasun** | 1. Finalise the production Docker Compose stack and document the deployed container architecture. 2. Set up a production monitoring placeholder: add `docker stats` output logging every 5 minutes. 3. Begin researching Python FastAPI Docker best practices for the new AI service container. 4. Plan the Phase 2 docker-compose additions: `ai-service` container, model volume, and network configuration. 5. Write the Phase 1C DevOps Completion Report. | 14 hrs |
| **Yoshadhi** | 1. Present the Phase 1C UAT Report in the Phase 1 Gate Review meeting. 2. Write the Phase 2 Test Strategy document: how AI model outputs will be validated (similarity relevance, cluster quality, risk score accuracy). 3. Research how to write Pytest test cases for FastAPI endpoints. 4. Set up a Pytest project skeleton in the `ai_service` directory. 5. Document the Phase 2 QA plan: what metrics constitute "acceptable" AI model performance. | 14 hrs |
| **Vedeshen** | 1. Facilitate the Phase 1 Gate Review meeting and produce minutes with formal sign-off. 2. Present the project to any stakeholders or supervisor for Phase 1 evaluation evidence. 3. Write Phase 2 User Stories (minimum 15): focusing on the AI dashboard, widget interactions, and risk score display. 4. Produce Phase 2 wireframes (low-fidelity): AI Dashboard page, Similar Incidents widget, Cluster Map widget, Risk Score widget. 5. Update the Sprint Backlog with Phase 2 stories. | 14 hrs |

**Phase 1C Deliverables**: `v1.0.0` tagged production release, seeded dataset, UAT report, Phase 1 Gate Review sign-off.

---

## ═══════════════════════════════════════════════════
## PHASE 2A — AI Engine Architecture & Design
## Weeks 15–18
## ═══════════════════════════════════════════════════

---

### WEEK 15 — AI Service Scaffold, FastAPI Foundation & Embedding Research
**Logbook Theme**: *"Phase 2 Kickoff: AI Microservice Architecture and Technology Evaluation"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Scaffold the `ai_service/` Python project: create folder structure (routers, services, models, db, tests). 2. Write `requirements.txt` with: fastapi, uvicorn, sentence-transformers, scikit-learn, pandas, numpy, umap-learn, apscheduler, sqlalchemy, asyncpg, python-dotenv. 3. Write `main.py` FastAPI entry point with CORS, lifespan events, and health check endpoint. 4. Implement async database connectivity using SQLAlchemy 2.0 + asyncpg connecting to the shared PostgreSQL instance. 5. Test that the FastAPI service starts inside Docker and the health check returns 200. | 14 hrs |
| **Chandupa** | 1. Create the `src/pages/AIDashboard.tsx` page with a placeholder layout for 3 widget areas. 2. Build the AI Widget card shell component: a `<AIWidget>` component with title, description, loading skeleton, error state, and content slot. 3. Research Recharts scatter plot (`<ScatterChart>`) and D3 force layout for the cluster map. Produce a proof-of-concept scatter plot with dummy data. 4. Build the Similar Incidents widget skeleton: a list of 5 cards, each showing incident title, severity badge, and similarity percentage bar. 5. Build the Risk Score widget skeleton: a circular gauge with a score number (0–100) and label. | 14 hrs |
| **Kasun** | 1. Add the `ai-service` container to `docker-compose.yml`: Python 3.11-slim image, volume mount for `ai_service/`, port 8001. 2. Write the `ai_service/Dockerfile` with multi-stage build: install dependencies, pre-download the Sentence Transformer model (`all-MiniLM-L6-v2`) during build. 3. Configure Docker networking so `backend` and `ai-service` containers can communicate by service name. 4. Verify that `sentence-transformers` model download is cached in the Docker image layer (to avoid re-downloading on every container start). 5. Update the CI pipeline to also build and test the AI service container. | 14 hrs |
| **Yoshadhi** | 1. Set up Pytest in `ai_service/tests/`: configure `conftest.py` with an async test client for FastAPI. 2. Write 5 Pytest test cases for the AI health check endpoint. 3. Research sentence-transformers library: understand what an embedding is, what cosine similarity measures, and how to interpret values (0 = orthogonal, 1 = identical). Document findings in a 2-page learning summary. 4. Write the AI Model Validation Plan: what constitutes "good" similarity results (qualitative evaluation approach). 5. Create test fixtures: load the 50 seeded incidents as a Pytest fixture for AI model tests. | 14 hrs |
| **Vedeshen** | 1. Produce medium-fidelity Figma wireframes for the AI Dashboard page: widget positions, tooltips, cluster map interaction (hover to see incident), risk score colour coding. 2. Write Phase 2 User Stories with full acceptance criteria: UC-020 (View Similar Incidents), UC-021 (View Cluster Map), UC-022 (View Risk Score on Form), UC-023 (Cluster Map Filtering). 3. Research K-Means clustering conceptually: write a plain-English explanation of what a cluster represents in the context of incident management. 4. Update the Traceability Matrix with Phase 2 user stories. 5. Begin writing the Project Report — Chapter 4: AI System Design. | 14 hrs |

---

### WEEK 16 — AI Model Selection, Embedding Pipeline & Database Extension
**Logbook Theme**: *"AI Engineering: Embedding Generation Pipeline and pgvector Integration"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement the `services/embeddings.py` module: load `all-MiniLM-L6-v2` model as a global singleton at startup. 2. Write the `create_incident_text()` function that concatenates title, description, root_cause, lessons_learned into a weighted text string. 3. Implement `generate_embedding(text: str) → np.ndarray` function. 4. Enable `pgvector` extension in the shared database and add the `vector(384)` column to `ai_embeddings`. 5. Write `store_embedding(incident_id, embedding)` that inserts or updates the embedding in `ai_embeddings`. | 14 hrs |
| **Chandupa** | 1. Implement the data fetching hook for the Similar Incidents widget: `useSimilarIncidents(incidentId)` using React Query — handles loading, error, and success states. 2. Implement the data fetching hook for the Cluster Map widget: `useClusterMap()`. 3. Implement the data fetching hook for the Risk Score widget: `useRiskScore(formData)` — called with debouncing as the user types in the incident form. 4. Configure React Query with a `QueryClient` that caches widget data for 5 minutes. 5. Wire the Similar Incidents widget to the real `useSimilarIncidents` hook (though API not yet implemented, test with mock data). | 14 hrs |
| **Kasun** | 1. Run `CREATE EXTENSION IF NOT EXISTS vector` in the production PostgreSQL container and verify pgvector is operational. 2. Write the SQL migration for the `ai_embeddings` table. 3. Create the IVFFlat index: `CREATE INDEX ON ai_embeddings USING ivfflat (embedding vector_cosine_ops)`. 4. Benchmark vector similarity queries: insert 50 test embeddings and measure query time with and without the index. 5. Document pgvector configuration and index strategy in `ARCHITECTURE.md`. | 14 hrs |
| **Yoshadhi** | 1. Write 10 Pytest test cases for the `create_incident_text()` function (empty fields, all fields populated, missing optional fields). 2. Write 10 Pytest test cases for the `generate_embedding()` function: verify output shape is (384,), values are floats, normalisation produces unit vectors. 3. Write 5 Pytest test cases for `store_embedding()`: insert succeeds, duplicate upsert updates correctly. 4. Test pgvector index creation in the test database. 5. Produce the Week 16 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Write a Technology Evaluation Report comparing: TF-IDF vs Sentence Transformers vs OpenAI Embeddings for this project's use case. Document why `all-MiniLM-L6-v2` was selected (free, offline, fast, sufficient quality). 2. Write the Model Selection Justification document for the project report. 3. Produce a Data Flow Diagram for the AI async pipeline (from incident closure → embedding generation → storage → widget query). 4. Update the Project Report Chapter 4 with the model selection section. 5. Produce weekly status report. | 14 hrs |

---

### WEEK 17 — Async Scheduler, Processing Pipeline & AI Endpoint Stubs
**Logbook Theme**: *"AI Pipeline Orchestration: Asynchronous Background Processing and API Stubs"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `scheduler.py` with APScheduler: a recurring job every 5 minutes that calls `process_unprocessed_incidents()`. 2. Implement `process_unprocessed_incidents()`: query `incidents WHERE ai_processed = FALSE AND status = 'CLOSED'`, generate embeddings, store them, set `ai_processed = TRUE`. 3. Create stub FastAPI router for `/api/ai/similar-incidents` (return hardcoded mock response). 4. Create stub router for `/api/ai/cluster-map` (return hardcoded mock cluster data). 5. Create stub router for `/api/ai/predict-risk` (return hardcoded mock risk response). | 14 hrs |
| **Chandupa** | 1. Wire all 3 AI widget hooks to the stub API endpoints and verify the UI renders correctly with the mock data. 2. Implement the Cluster Map scatter plot using Recharts `<ScatterChart>`: dots coloured by cluster, hover tooltip showing incident title and severity. 3. Implement the Similar Incidents widget with mock data: 5 incident cards with animated similarity progress bars. 4. Implement the Risk Score gauge: an SVG arc gauge that animates from 0 to the score value on load. 5. Implement cluster filter chips above the cluster map: click a cluster chip to highlight only that cluster's points. | 14 hrs |
| **Kasun** | 1. Integrate the Core Backend with the AI Service: in `incidentController.js`, after a successful `/close` operation, fire an async POST to `ai-service:8001/api/ai/process` (non-blocking). 2. Implement a retry mechanism: if the AI service notification fails, store the incident ID in a Redis queue for retry. 3. Write Docker Compose health checks for the AI service container. 4. Verify the full container startup sequence: postgres → backend → ai-service → frontend. 5. Update the production deployment runbook with Phase 2 AI service steps. | 14 hrs |
| **Yoshadhi** | 1. Write 10 Pytest test cases for the APScheduler integration: verify the `process_unprocessed_incidents` job runs and marks incidents as `ai_processed = TRUE`. 2. Write 10 Pytest test cases for the stub AI endpoints: verify response structure matches the Pydantic schema. 3. Verify the Core Backend → AI Service notification flow (close an incident, verify the AI service receives the request). 4. Write integration test: close 3 incidents in the Core Backend and verify all 3 appear in `ai_embeddings` table after scheduler runs. 5. Produce the Week 17 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Produce the final medium-fidelity Figma wireframes for the AI widgets with the mock data filling in the designs. 2. Conduct a wireframe review session with Chandupa to verify the UI implementation matches the Figma designs. 3. Write acceptance criteria for UC-024 (AI processing pipeline runs automatically), UC-025 (Widget loads in under 2 seconds). 4. Update the Project Report Chapter 4 with the pipeline architecture section. 5. Produce the Phase 2A mid-point Status Report. | 14 hrs |

---

### WEEK 18 — AI Architecture Freeze & Phase 2A Gate Review
**Logbook Theme**: *"Phase 2A Gate: Architecture Design Freeze and Implementation Readiness"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Complete and review all Pydantic schemas in `models/schemas.py`: `SimilarIncidentRequest`, `SimilarIncidentsResponse`, `ClusterMapResponse`, `RiskPredictionRequest`, `RiskPredictionResponse`. 2. Write the complete OpenAPI documentation for all 5 AI endpoints (Swagger UI accessible at `ai-service:8001/docs`). 3. Process all 50 seeded closed incidents through the embedding pipeline manually (run the scheduler once). 4. Verify 50 embeddings are stored in `ai_embeddings` with correct dimensions. 5. Perform a Phase 2A architecture review and document any design gaps. | 14 hrs |
| **Chandupa** | 1. Finalise the AI Dashboard page layout: widget positioning, responsive grid (Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). 2. Implement skeleton loading states for all 3 widgets. 3. Implement error states for all 3 widgets (retry button, error message). 4. Polish the Cluster Map: colour palette for clusters (ensure accessibility — colour-blind safe palette). 5. Implement a "Last Updated" timestamp on each widget showing when data was last refreshed. | 14 hrs |
| **Kasun** | 1. Finalise the `docker-compose.yml` with all 4 services (postgres, backend, ai-service, frontend) and verify clean startup. 2. Write the Phase 2A DevOps Architecture document: how the 4 containers communicate, volume mounts, network topology. 3. Implement log aggregation for the AI service: write Python `logging` configuration that writes to a Docker-mounted log volume. 4. Configure resource limits in Docker Compose for the AI service container (memory limit: 2GB — sentence-transformers model needs RAM). 5. Conduct a full environment test: `docker-compose down -v && docker-compose up --build` from scratch. | 14 hrs |
| **Yoshadhi** | 1. Verify all 50 embeddings are correctly stored (query `ai_embeddings` and check row count, vector dimensions). 2. Write the Phase 2A QA Summary: what was validated, pass rate, open issues. 3. Write the Go/No-Go recommendation for Phase 2B based on architecture readiness. 4. Produce the AI Testing Methodology document: how to objectively evaluate NLP similarity quality. 5. Update the master Test Plan with Phase 2B test cases outline. | 14 hrs |
| **Vedeshen** | 1. Facilitate the Phase 2A Gate Review meeting: present AI architecture, Swagger docs, widget prototypes, and 50 embedded incidents. 2. Produce formal Gate Review Minutes with team sign-off. 3. Freeze the Phase 2 wireframes (no structural UI changes after this point). 4. Write the Project Report — Chapter 4 fully: AI architecture, model selection, data pipeline, Pydantic schemas. 5. Update the Traceability Matrix with Phase 2A items. | 14 hrs |

**Phase 2A Deliverables**: AI service scaffold running in Docker, 50 embeddings generated, Swagger docs, Pydantic schemas, Phase 2A Gate Review sign-off.

---

## ═══════════════════════════════════════════════════
## PHASE 2B — AI Model Development & Widget Build
## Weeks 19–28
## ═══════════════════════════════════════════════════

---

### WEEK 19 — Widget 1 (Part 1): Cosine Similarity Implementation
**Logbook Theme**: *"AI Development: Implementing Cosine Similarity for Incident Retrieval"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `find_similar_incidents(incident_id, top_k)` in `services/embeddings.py`: fetch source embedding, fetch all other embeddings, compute `cosine_similarity`, sort, return top_k. 2. Replace the stub `similar-incidents` router with the real implementation. 3. Test with 5 different source incidents — manually evaluate if returned similar incidents make semantic sense. 4. Implement `text_hash` caching: if incident text hasn't changed, reuse the existing embedding. 5. Write comprehensive docstrings for all embedding service functions. | 14 hrs |
| **Chandupa** | 1. Wire the Similar Incidents widget to the real API endpoint (replace mock data with real API call). 2. Implement a loading animation specific to the Similar Incidents widget: a subtle pulse on the 5 placeholder cards. 3. Make each similar incident card clickable — clicking navigates to the Incident Detail page for that incident. 4. Implement "Similarity score" colour coding: >0.9 = green, 0.7–0.9 = yellow, <0.7 = red. 5. Add a "Why similar?" tooltip on each card: display the top matching text excerpt. | 14 hrs |
| **Kasun** | 1. Implement the embedding computation as an async background task in FastAPI: when `POST /api/ai/process` is called, schedule the embedding computation as a non-blocking `BackgroundTask`. 2. Add rate limiting to the AI service endpoints: max 60 requests per minute per IP. 3. Write a performance benchmark: measure time to compute cosine similarity for 50, 100, 500, 1000 embeddings. 4. Implement response time logging for all AI endpoints using FastAPI middleware. 5. Document the similarity computation performance characteristics in `ARCHITECTURE.md`. | 14 hrs |
| **Yoshadhi** | 1. Write 20 Pytest test cases for `find_similar_incidents()`: correct top_k count, valid score range (0–1), source incident not in results, non-existent incident_id returns None. 2. Execute a qualitative evaluation: choose 5 incidents manually, identify their expected "most similar" incident from the dataset, and verify the API returns them in the top 3 results. Document accuracy rate. 3. Write 10 Postman test cases for `GET /api/ai/similar-incidents`. 4. Verify widget renders correctly with real data in the browser. 5. Produce the Week 19 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Write the Qualitative Evaluation Methodology document: how to judge whether similar incident results are meaningful (the "5 manual test" procedure). 2. Review the 5 qualitative test results from Yoshadhi and write a 1-page analysis. 3. Update the Project Report with a section on cosine similarity mathematics (plain English explanation + formula). 4. Write UC-020 verification evidence (screenshots of the Similar Incidents widget with real data). 5. Produce weekly status report. | 14 hrs |

---

### WEEK 20 — Widget 1 (Part 2): TF-IDF Fallback & Similarity Tuning
**Logbook Theme**: *"AI Refinement: TF-IDF Baseline Comparison and Similarity Threshold Tuning"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement a TF-IDF fallback in `services/embeddings.py`: if fewer than 10 incidents have embeddings, use `TfidfVectorizer` instead. 2. Add a `?method=tfidf` query parameter to the similar-incidents endpoint to allow method switching for comparison. 3. Implement a minimum similarity threshold filter: only return results with score > 0.5 (configurable via environment variable). 4. Implement response caching: cache similar-incident results in memory (Python `functools.lru_cache`) for 10 minutes. 5. Profile the embedding service with Python `cProfile` and identify any performance bottlenecks. | 14 hrs |
| **Chandupa** | 1. Add a "Method" toggle to the Similar Incidents widget: switch between "Semantic" (Sentence Transformer) and "Keyword" (TF-IDF) and reload results. 2. Implement an animation when the widget reloads: cards fade out and fade in with new results. 3. Add a "No similar incidents found" state to the widget with a helpful message. 4. Implement pagination for the Similar Incidents widget: "Show more" button to load top 10 instead of 5. 5. Conduct a self-review of the widget against the Figma design and fix discrepancies. | 14 hrs |
| **Kasun** | 1. Implement in-memory caching for embeddings using Python `lru_cache` and measure the cache hit rate improvement. 2. Add monitoring: log how many incidents are processed per scheduler run. 3. Write a load test script using `locust` or `httpx` to simulate 20 concurrent requests to the similarity endpoint. 4. Document the cache configuration and invalidation strategy. 5. Update the performance baseline document with AI service response times. | 14 hrs |
| **Yoshadhi** | 1. Write 10 Pytest tests for the TF-IDF fallback (activates correctly when embedding count < 10). 2. Write 10 tests for the similarity threshold filter (results below 0.5 are excluded). 3. Compare TF-IDF vs Sentence Transformer results on 5 test incidents — document which method produces more relevant results. 4. Write the TF-IDF vs Sentence Transformer comparison report. 5. Run the load test and document results. | 14 hrs |
| **Vedeshen** | 1. Write the Project Report section on TF-IDF vs Sentence Transformers: theory, practical comparison, findings. 2. Update the Technology Evaluation Report with the comparison test results. 3. Write UC-021 acceptance test evidence. 4. Produce a revised Data Distribution Analysis: now that embeddings are generated, are incident topics evenly distributed? 5. Update the Traceability Matrix. | 14 hrs |

---

### WEEK 21 — Widget 2 (Part 1): K-Means Clustering Implementation
**Logbook Theme**: *"Unsupervised Learning: K-Means Clustering for Incident Categorisation"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `services/clustering.py`: `find_optimal_k(embeddings)` using Silhouette Score across k=2 to k=min(10, n_incidents//5). 2. Implement `refit_clustering_model()`: fetch all embeddings → find optimal K → fit KMeans → store cluster_id in `incidents.cluster_id`. 3. Implement UMAP 2D reduction: `reducer = umap.UMAP(n_components=2)`, fit on all embeddings, store `umap_x` and `umap_y` in `ai_embeddings`. 4. Replace the stub `cluster-map` router with real implementation. 5. Integrate `refit_clustering_model()` into the background scheduler: run after embedding processing. | 14 hrs |
| **Chandupa** | 1. Wire the Cluster Map widget to the real `/api/ai/cluster-map` endpoint. 2. Implement the full Recharts scatter plot: x/y axes (UMAP dimensions), dots coloured by `cluster_id` using a D3 colour scale (`d3-scale-chromatic`). 3. Implement hover tooltip on each dot: show incident title, severity, category, and cluster label. 4. Implement zoom and pan on the scatter plot using `recharts` ResponsiveContainer + custom zoom handler. 5. Build cluster legend: chips showing Cluster 0, Cluster 1, etc., colour-coded and toggleable. | 14 hrs |
| **Kasun** | 1. Persist the trained KMeans model to disk: save to `/app/models/kmeans_model.pkl` using `pickle`. Configure the `ai_models` Docker volume to persist this file. 2. Implement model loading at AI service startup: if `kmeans_model.pkl` exists, load it to avoid retraining on cold start. 3. Write a `POST /api/ai/retrain` endpoint (admin only) that forces a full model refit. 4. Implement a model version file (`models/version.json`) tracking when the model was last trained and on how many incidents. 5. Document the model persistence strategy. | 14 hrs |
| **Yoshadhi** | 1. Write 15 Pytest tests for `find_optimal_k()`: returns value in valid range, handles edge case of <4 incidents, silhouette score is positive. 2. Write 15 Pytest tests for `refit_clustering_model()`: cluster_ids are assigned, UMAP coordinates are generated, model file is saved. 3. Verify cluster map renders correctly in the browser with real UMAP coordinates. 4. Conduct qualitative cluster review: do incidents in the same cluster share a common theme? Document findings. 5. Write the K-Means Clustering QA Report. | 14 hrs |
| **Vedeshen** | 1. Research and write a 3-page explanation of K-Means clustering for the project report: algorithm steps, silhouette score, and what UMAP does. 2. Produce the Cluster Analysis Report: document the optimal K found, describe what each cluster represents (manually label each cluster based on its incidents). 3. Write acceptance criteria evidence for UC-021 (Cluster Map). 4. Update Project Report Chapter 5 (AI Implementation) with the clustering section. 5. Produce weekly status report. | 14 hrs |

---

### WEEK 22 — Widget 2 (Part 2): Cluster Labelling & Map Interactions
**Logbook Theme**: *"Cluster Intelligence: Automatic Labelling and Interactive Map Enhancements"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement automatic cluster label generation: for each cluster, extract the top 5 TF-IDF terms from its incidents' text and use the top term as the cluster label (e.g., "network", "security"). 2. Store cluster labels in a new `cluster_labels` table: `cluster_id`, `label`, `top_terms[]`, `incident_count`. 3. Update the cluster-map response to include `cluster_labels`. 4. Implement `GET /api/ai/cluster-stats`: for each cluster, return incident count, severity distribution, and average resolution time. 5. Add the cluster-stats endpoint to Swagger docs. | 14 hrs |
| **Chandupa** | 1. Display auto-generated cluster labels in the Cluster Map legend (e.g., "Cluster 0 — network (12 incidents)"). 2. Implement click-to-filter: clicking a cluster legend chip filters the scatter plot to show only that cluster's dots. 3. Build the Cluster Stats panel: a sidebar that appears when a cluster legend chip is clicked, showing: incident count, severity breakdown (bar chart), and average resolution time. 4. Implement the "Reset Filter" button to show all clusters again. 5. Implement a search box above the cluster map: search for an incident by title and highlight its dot on the map. | 14 hrs |
| **Kasun** | 1. Create the `cluster_labels` database table and migration. 2. Implement the cluster labelling as part of the `refit_clustering_model()` pipeline. 3. Write a script to force-regenerate cluster labels: `scripts/recluster.sh`. 4. Add the `GET /api/ai/cluster-stats` endpoint with DB query optimisation (aggregate query in SQL, not Python). 5. Benchmark the cluster-map endpoint with 50, 200, 500 incidents and document scaling behaviour. | 14 hrs |
| **Yoshadhi** | 1. Write 10 Pytest tests for auto cluster labelling: labels are non-empty strings, stored in DB. 2. Write 10 tests for `GET /api/ai/cluster-stats`: correct incident counts, valid severity distributions. 3. Test the cluster filter interaction in the UI: clicking a chip correctly shows only that cluster's points. 4. Verify the cluster search function highlights the correct dot. 5. Produce the Week 22 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Manually review auto-generated cluster labels for the 50-incident dataset and assess quality. Write a 1-page label quality assessment. 2. Write user stories for cluster filtering: UC-026 (Filter Cluster Map by Cluster), UC-027 (View Cluster Statistics). 3. Update the Cluster Analysis Report with auto-generated labels. 4. Update Project Report Chapter 5 with the cluster labelling section. 5. Update the Traceability Matrix. | 14 hrs |

---

### WEEK 23 — Widget 3 (Part 1): Risk Classifier Training Pipeline
**Logbook Theme**: *"Predictive Analytics: Training the Incident Risk Classification Model"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement `services/classifier.py`: `prepare_training_data()` — query all closed incidents with embeddings, build feature matrix (embeddings + one-hot categorical features). 2. Implement `train_risk_classifier()`: fit `GradientBoostingClassifier`, compute 5-fold cross-validation accuracy, save model bundle (`classifier.pkl`). 3. Implement `predict_risk(title, description, category, department)`: load model, encode input, return score + label + confidence. 4. Replace stub risk router with real implementation. 5. Trigger initial model training manually and verify `classifier.pkl` is generated. | 14 hrs |
| **Chandupa** | 1. Wire the Risk Score widget to the real `/api/ai/predict-risk` endpoint. 2. Implement the animated gauge: when the score changes, the arc animates to the new value using CSS transitions. 3. Add colour-coded risk zones to the gauge: green (0–33), yellow (34–66), red (67–100). 4. In the Create Incident form (Step 1), implement live risk prediction: as the user types the title and description (debounced 500ms), call the risk endpoint and display the predicted score in a small inline widget on the form. 5. Add a disclaimer text under the inline risk score: "AI-predicted score. Subject to review." | 14 hrs |
| **Kasun** | 1. Add the `GET /api/ai/model-status` endpoint: return current model version, training date, training accuracy, and number of training samples. 2. Implement a model warm-up at startup: run a test prediction to ensure the model is loaded and ready before accepting requests. 3. Write a `POST /api/ai/retrain-classifier` endpoint (admin only) that retrains on the latest data. 4. Implement model file integrity check: verify the `.pkl` file is valid on load (not corrupted). 5. Add the classifier training as a weekly scheduled job in APScheduler (runs every Sunday at midnight). | 14 hrs |
| **Yoshadhi** | 1. Write 20 Pytest tests for `train_risk_classifier()`: model file is created, CV accuracy is above 0.6, label encoder covers all 4 classes. 2. Write 20 Pytest tests for `predict_risk()`: score in 0–100 range, label is valid enum, confidence in 0–1. 3. Test the live risk prediction widget: type in the form and verify score updates. 4. Test the model status endpoint. 5. Write the Risk Classifier QA Report. | 14 hrs |
| **Vedeshen** | 1. Write a 3-page explanation of Gradient Boosting for the project report: how it works, why it's suitable for this use case. 2. Document the training data distribution: severity level breakdown in the 50 training incidents, class balance analysis. 3. Write UC-022 acceptance criteria evidence (risk score appears on form). 4. Update Project Report Chapter 5 with the risk classifier section. 5. Produce the Week 23 status report. | 14 hrs |

---

### WEEK 24 — Widget 3 (Part 2): Risk Model Evaluation & Feature Importance
**Logbook Theme**: *"Model Validation: Risk Classifier Evaluation and Explainability"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement model evaluation metrics in `train_risk_classifier()`: compute confusion matrix, precision, recall, F1-score per class and store in the model bundle. 2. Implement `GET /api/ai/classifier-metrics` endpoint returning the confusion matrix and per-class metrics. 3. Implement feature importance extraction: `clf.feature_importances_` for GradientBoosting, identify top 10 most predictive features. 4. Add `contributing_factors` to the `predict_risk` response: list the top 3 features that drove the prediction. 5. Write an AB test: train with embeddings only vs embeddings + categorical features, compare accuracy. | 14 hrs |
| **Chandupa** | 1. Build the Model Performance card in the AI Dashboard: display classifier accuracy, precision, recall, and F1 score in a formatted metrics table. 2. Display the confusion matrix as a colour-coded 4×4 heatmap (CSS grid with background-color intensity). 3. In the risk widget, display the `contributing_factors` as small tags below the score (e.g., `#network_category`, `#description_keywords`). 4. Implement a "Model Last Trained" indicator in the AI Dashboard header. 5. Add tooltips to all metric values explaining what precision/recall/F1 means in plain English. | 14 hrs |
| **Kasun** | 1. Implement `GET /api/ai/classifier-metrics` with DB-backed storage of the latest metrics (so metrics survive AI service restarts). 2. Create a `model_metrics` table: `model_type`, `accuracy`, `precision`, `recall`, `f1_score`, `training_samples`, `trained_at`. 3. Store metrics after each training run. 4. Write the AB test infrastructure: CLI script to train two model variants and compare metrics. 5. Document the AB test results in `ARCHITECTURE.md`. | 14 hrs |
| **Yoshadhi** | 1. Write 10 Pytest tests for classifier metrics (confusion matrix shape is 4×4, precision/recall values in 0–1 range). 2. Perform the AB test (embeddings only vs embeddings + categorical) and document results. 3. Write the Model Evaluation Report: confusion matrix interpretation, which severity classes are hardest to predict, and recommended improvements. 4. Test the contributing factors in the API response and verify they're meaningful. 5. Produce the Week 24 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Write the Model Evaluation section for the Project Report (Chapter 5): confusion matrix table, precision/recall/F1 table, interpretation. 2. Write the AB Test Results section: what the test showed, which feature set is better. 3. Produce all model performance screenshots for the project report appendix. 4. Update the Traceability Matrix for Widget 3 acceptance criteria. 5. Update the Risk Register: document the risk of low model accuracy with fewer training incidents. | 14 hrs |

---

### WEEK 25 — Data Augmentation, Model Retraining & Second Seeding Round
**Logbook Theme**: *"Model Improvement: Data Augmentation, Expanded Dataset, and Retraining"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Increase the training dataset: coordinate with Vedeshen to add 50 more seeded incidents (total 100). 2. Retrain all models (KMeans + Classifier) on the expanded dataset and compare metrics. 3. Implement a data validation function: before training, check for null embeddings, empty texts, missing severity labels — skip invalid records with a warning log. 4. Implement incremental embedding: only process newly added incidents, don't re-process existing ones. 5. Update the model version tracking system to store metric history (previous and current accuracy). | 14 hrs |
| **Chandupa** | 1. Update the Cluster Map with new cluster assignments from the retrained KMeans model. 2. Implement a "Cluster Map refresh" button that re-fetches data from the API. 3. Implement animated transitions when the cluster map data reloads (dots smoothly move to new positions). 4. Build a "Trends" mini-widget in the Dashboard overview: line chart showing incident count per week over time (Recharts `<LineChart>`). 5. Implement light/dark mode toggle using Tailwind `dark:` classes and a toggle button in the TopNav. | 14 hrs |
| **Kasun** | 1. Execute the expanded seeding on production PostgreSQL. 2. Trigger full model retraining on expanded dataset. 3. Verify all 100 incidents have embeddings and cluster assignments. 4. Measure system performance with 100 incidents: response times for similarity, cluster map, and risk endpoints. 5. Update the performance baseline document with 100-incident benchmarks. | 14 hrs |
| **Yoshadhi** | 1. Re-run the qualitative similarity evaluation on 5 test incidents using the retrained model — compare with Week 19 results. 2. Re-run the confusion matrix test on the retrained classifier. 3. Write the Model Improvement Report: before vs after retraining comparison. 4. Test the light/dark mode toggle — verify all UI components render correctly in both modes. 5. Produce the Week 25 QA Progress Report. | 14 hrs |
| **Vedeshen** | 1. Write 50 additional seeded incident records (with all 7 objects) covering new categories and department combinations to improve training data diversity. 2. Write the Data Augmentation Strategy document: why more diverse data improves model performance. 3. Update the Data Distribution Analysis with the 100-incident dataset. 4. Update Project Report with the model improvement section. 5. Produce the weekly status report. | 14 hrs |

---

### WEEK 26 — Full AI Dashboard Integration & End-to-End Widget Testing
**Logbook Theme**: *"System Integration: All Three AI Widgets Live on the Dashboard"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Conduct a comprehensive review of all 5 AI endpoints: verify all Pydantic validation, error handling, and response formats are correct. 2. Implement a `/api/ai/batch-process` endpoint for admin use: process up to 100 unprocessed incidents in one call. 3. Fix all open AI service bugs from the GitHub Issues tracker. 4. Write comprehensive API error handling: 404 (not found), 422 (validation), 500 (model not trained yet) with descriptive messages. 5. Write the AI Service API changelog in `CHANGELOG.md`. | 14 hrs |
| **Chandupa** | 1. Integrate all 3 AI widgets into the final AI Dashboard page layout with the correct grid positions. 2. Implement widget-level error recovery: if the AI service is down, widgets display a graceful "AI service unavailable" message without crashing the page. 3. Implement the "Open in Incident Detail" link on each Similar Incidents card. 4. Implement a global AI Dashboard refresh button that invalidates all React Query caches and refetches. 5. Conduct a full UI walkthrough of the AI Dashboard and fix all visual inconsistencies. | 14 hrs |
| **Kasun** | 1. Verify the end-to-end flow: create new incident → close it → verify it's processed by the AI scheduler → verify it appears in all 3 widget outputs. 2. Write an end-to-end integration test script (shell script that calls APIs in sequence and verifies the full AI pipeline). 3. Implement Docker health checks for all 4 containers with `docker inspect` verification. 4. Write the final production Docker Compose file review. 5. Document all environment variables in a comprehensive `.env.example`. | 14 hrs |
| **Yoshadhi** | 1. Execute the end-to-end AI pipeline integration test (create → close → verify AI processing → verify all 3 widgets update). 2. Write 20 end-to-end integration test cases covering the full AI pipeline. 3. Execute a full regression test of all Phase 1 functionality to verify no regressions. 4. Write the Phase 2B Integration Test Report. 5. Produce the Go/No-Go recommendation for Phase 2C. | 14 hrs |
| **Vedeshen** | 1. Produce all Phase 2B UAT evidence: screenshots of all 3 widgets with real data, acceptance criteria checklist. 2. Write Phase 2B User Acceptance Testing results for all Phase 2 user stories. 3. Update the Traceability Matrix to 100% coverage for Phase 2 requirements. 4. Begin writing the Project Report — Chapter 6: Testing and Evaluation. 5. Produce the Phase 2B Completion Report for academic supervisor. | 14 hrs |

---

### WEEK 27 — UI/UX Polish, Accessibility & Performance Optimisation
**Logbook Theme**: *"Quality Engineering: Accessibility Compliance, Performance Tuning, and UI Polish"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement DB query optimisation for the AI service: add a composite index on `incidents(ai_processed, status)`. 2. Implement lazy loading for embeddings: fetch only the embedding vector (not all incident metadata) when computing similarity. 3. Profile the `find_similar_incidents` function for 100 incidents and document time complexity. 4. Implement API response pagination for `GET /api/ai/cluster-map` (optional, for future scalability). 5. Write the Phase 2B Backend Technical Summary document. | 14 hrs |
| **Chandupa** | 1. Conduct a full WCAG 2.1 AA accessibility audit: check colour contrast ratios, keyboard navigation, ARIA labels on all interactive elements, and screen reader compatibility for the dashboard. 2. Fix all accessibility issues found in the audit. 3. Implement keyboard navigation for the Cluster Map: Tab to select dots, Enter to open incident. 4. Optimise React performance: use `React.memo`, `useMemo`, and `useCallback` on expensive components. 5. Implement code splitting using `React.lazy()` and `Suspense` for the AI Dashboard page. | 14 hrs |
| **Kasun** | 1. Implement Nginx gzip compression for API responses. 2. Run a load test simulating 50 concurrent users on the full system and document results. 3. Optimise Docker image sizes: use multi-stage builds and `.dockerignore` files. 4. Implement container auto-restart policy and verify recovery from simulated crashes. 5. Write the Performance Testing Report. | 14 hrs |
| **Yoshadhi** | 1. Conduct the accessibility audit alongside Chandupa and write the Accessibility Test Report (WCAG 2.1 AA compliance checklist). 2. Verify keyboard navigation on all interactive UI elements. 3. Test with a screen reader (Windows Narrator or NVDA) on the Incident Register and AI Dashboard. 4. Write 10 accessibility-specific test cases. 5. Run the load test and validate system behaviour under concurrent users. | 14 hrs |
| **Vedeshen** | 1. Write the Project Report — Chapter 6: Testing and Evaluation (Phase 1 test results, Phase 2 AI model evaluation, accessibility testing). 2. Write the Project Report — Chapter 7: Discussion (challenges faced, how they were resolved, comparison with similar systems). 3. Compile all screenshots and evidence for the project report appendix. 4. Produce the Accessibility Compliance Statement. 5. Update the Traceability Matrix to final state. | 14 hrs |

---

### WEEK 28 — Security Hardening, Final Feature Completion & Documentation
**Logbook Theme**: *"Security and Completeness: Hardening the System for Production Evaluation"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Implement security headers on the AI service (CORS, rate limiting, content-type validation). 2. Audit all SQL queries for potential injection vulnerabilities (verify Prisma parameterised queries everywhere). 3. Implement API key authentication for internal Core Backend → AI Service communication (prevent external access to AI endpoints without a key). 4. Write the Security Audit Report: what was checked, what was fixed. 5. Finalise all backend API documentation (Swagger for Core Backend + FastAPI auto-docs). | 14 hrs |
| **Chandupa** | 1. Implement the final missing UI feature: a Notification Centre (bell icon in TopNav) showing recent AI processing completions and overdue action alerts. 2. Fix all remaining UI bugs from the QA regression test. 3. Implement a full print/PDF stylesheet for the Incident Detail view (formatted as a professional incident report). 4. Write the Frontend Technical Summary document: component architecture, state management strategy, performance optimisations applied. 5. Conduct a final self-audit of the entire UI against the Figma wireframes. | 14 hrs |
| **Kasun** | 1. Implement Docker secrets for sensitive environment variables (DB password, JWT secret, AI API key). 2. Write the Production Security Configuration Guide: secure Docker Compose, HTTPS setup, environment variable management. 3. Implement container image scanning (using `docker scout` or `trivy`) and document any critical vulnerabilities. 4. Write the final Production Deployment Runbook (complete, step-by-step, suitable for a new team member to deploy). 5. Produce the DevOps Final Summary document. | 14 hrs |
| **Yoshadhi** | 1. Conduct a final full regression test of the entire system (Phase 1 + Phase 2). 2. Perform penetration testing basics: test for SQL injection via API, XSS via form inputs, JWT token manipulation. 3. Write the Security Test Report. 4. Verify all API endpoints return correct HTTP status codes for all edge cases. 5. Write the Final QA Summary Report: total test cases written, total executed, pass rate, defect density, open defects. | 14 hrs |
| **Vedeshen** | 1. Write the Project Report — Chapter 8: Conclusion and Future Work (summary of achievements, limitations, future enhancements like real-time updates, mobile app, more ML models). 2. Compile the complete Bibliography in the correct citation format. 3. Write the Executive Summary (1-page overview of the project for the front matter). 4. Produce the final complete User Manual: how to log in, create an incident, progress through all 7 objects, and interpret AI widgets. 5. Review the entire project report for consistency, spelling, and formatting. | 14 hrs |

---

## ═══════════════════════════════════════════════════
## PHASE 2C — Integration Testing, Tuning & Final Deployment
## Weeks 29–30
## ═══════════════════════════════════════════════════

---

### WEEK 29 — Final Integration Testing, Model Tuning & Pre-Production
**Logbook Theme**: *"Phase 2C: Final Integration Validation and Model Optimisation"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Perform final AI pipeline integration test: close 10 new incidents, wait for scheduler, verify all 10 appear in similarity results, cluster map, and risk predictions. 2. Tune the APScheduler interval based on performance testing (adjust from 5 minutes if necessary). 3. Implement a manual trigger endpoint `POST /api/ai/process-all` that processes ALL unprocessed incidents immediately (for testing). 4. Fix all remaining AI service bugs (priority: Critical and High severity). 5. Write the final Backend and AI Service handover documentation. | 14 hrs |
| **Chandupa** | 1. Fix all remaining frontend bugs from final regression testing. 2. Build the final production React bundle (`npm run build`) and verify it works served via Nginx. 3. Test the production frontend against the production backend — verify no environment-specific bugs. 4. Implement a `VERSION` display in the app footer: version number, build date, and environment. 5. Write the Frontend Handover Document: how to run, build, configure, and extend the React app. | 14 hrs |
| **Kasun** | 1. Execute the full production deployment: `docker-compose -f docker-compose.prod.yml up -d --build`. 2. Verify all 4 containers are healthy and operational in production mode. 3. Execute the complete seeded dataset on the production database (all 100 incidents). 4. Trigger full model retraining in production and verify models are generated. 5. Write the Production Environment Verification Checklist (all services up, all endpoints responding, models trained, data present). | 14 hrs |
| **Yoshadhi** | 1. Execute the final complete regression test suite against the production environment. 2. Write 20 final end-to-end test cases covering the critical user journeys: New User → Login → Create Incident → Complete all 7 Objects → AI Widgets show updated results. 3. Execute all critical and high severity test cases and document results. 4. Write the Final Test Execution Report with pass/fail evidence (screenshots). 5. Write the formal Go/No-Go recommendation for the Final Production Release. | 14 hrs |
| **Vedeshen** | 1. Conduct a final review of the complete Project Report — all chapters, references, appendices. 2. Produce the final Traceability Matrix: every user story traced to requirement, design, implementation, and test case. 3. Prepare the academic submission package: project report, appendices, and evidence documents. 4. Write the Logbook Entry 29 template and distribute to the team. 5. Coordinate with supervisor for final pre-submission review. | 14 hrs |

---

### WEEK 30 — Final Production Deployment, Demo Preparation & Project Closure
**Logbook Theme**: *"Project Closure: Final Deployment, Academic Submission, and Retrospective"*

| Member | Tasks | Est. Hours |
|--------|-------|-----------|
| **Kithsara** | 1. Apply final production tag: `git tag v2.0.0` and push. 2. Write the final AI Service Technical Documentation (architecture overview, endpoint reference, configuration guide). 3. Record a 5-minute technical demo walkthrough of the AI pipeline for the presentation. 4. Prepare technical presentation slides covering: architecture, AI implementation, challenges, and outcomes. 5. Write the personal Contribution Statement for academic submission (detailing individual hours, tasks completed, and skills developed). | 14 hrs |
| **Chandupa** | 1. Finalise the production frontend deployment and record a 3-minute UI demo walkthrough (all 3 AI widgets in action). 2. Prepare UI/UX presentation section: show before/after Figma wireframes vs final implementation. 3. Write the Frontend Component Library documentation (all reusable components, props, usage examples). 4. Write the personal Contribution Statement. 5. Archive all frontend design assets (Figma exports, style guide) in the project repository. | 14 hrs |
| **Kasun** | 1. Archive the production Docker environment: export final `docker-compose.prod.yml` and all configuration files. 2. Write the final Infrastructure and DevOps Summary Report: all CI/CD decisions, container architecture, performance results. 3. Record a 3-minute DevOps demo: show `docker-compose up` from scratch and the system going live. 4. Write the personal Contribution Statement. 5. Transfer all DevOps scripts and documentation to the final project repository structure. | 14 hrs |
| **Yoshadhi** | 1. Compile the Final QA Portfolio: test plan, all test case spreadsheets, all QA reports, bug report log, and UAT results. 2. Write the final QA Summary presentation section: total defects found and resolved, quality metrics, model validation results. 3. Record a 2-minute QA demo: show Pytest running, Postman collection running, and Newman passing. 4. Write the personal Contribution Statement. 5. Archive all QA documentation in the project repository under `docs/qa/`. | 14 hrs |
| **Vedeshen** | 1. Finalise and submit the complete Project Report to the academic supervisor. 2. Compile the final academic submission package: project report, individual contribution statements, logbook (30 entries), and evidence appendix. 3. Facilitate the final Project Retrospective meeting: what went well, what to improve, key learning outcomes. Produce the retrospective report. 4. Write the personal Contribution Statement. 5. Archive all BA documentation (SRS, wireframes, user stories, traceability matrix) in `docs/ba/`. | 14 hrs |

**Phase 2C Deliverables**: `v2.0.0` production release, final project report, 30 logbook entries complete, individual contribution statements, all QA documentation, demonstration-ready system.

---

## Summary Tables

### Cumulative Hour Tracking (Per Member, Per Phase)

| Phase | Weeks | Hrs/Week | Kithsara | Chandupa | Kasun | Yoshadhi | Vedeshen |
|-------|-------|----------|----------|----------|-------|----------|----------|
| 1A | 1–4 | 14 | 56 | 56 | 56 | 56 | 56 |
| 1B | 5–12 | 14 | 112 | 112 | 112 | 112 | 112 |
| 1C | 13–14 | 14 | 28 | 28 | 28 | 28 | 28 |
| 2A | 15–18 | 14 | 56 | 56 | 56 | 56 | 56 |
| 2B | 19–28 | 14 | 140 | 140 | 140 | 140 | 140 |
| 2C | 29–30 | 14 | 28 | 28 | 28 | 28 | 28 |
| **TOTAL** | **30 wks** | **14** | **420** | **420** | **420** | **420** | **420** |

> ✅ All members: **420 hours** — exceeds the 400-hour academic requirement by 20 hours (5% buffer).

---

### Key Deliverable Milestone Tracker

| Week | Milestone | Owner |
|------|-----------|-------|
| 4 | Phase 1A Gate Review Sign-off | All |
| 8 | All 7 Lifecycle Object APIs complete | Kithsara |
| 8 | All 7 Form Steps complete in UI | Chandupa |
| 12 | Phase 1B full system integration | All |
| 13 | 100 seeded closed incidents in DB | Vedeshen + Kasun |
| 14 | `v1.0.0` Production Release | Kasun |
| 14 | Phase 1 Gate Review Sign-off | All |
| 18 | 50 embeddings generated, AI service running | Kithsara |
| 18 | Phase 2A Gate Review Sign-off | All |
| 19 | Widget 1 (Similar Incidents) — LIVE | Kithsara + Chandupa |
| 21 | Widget 2 (Cluster Map) — LIVE | Kithsara + Chandupa |
| 23 | Widget 3 (Risk Scoring) — LIVE | Kithsara + Chandupa |
| 26 | All 3 AI Widgets integrated & tested | All |
| 28 | Security hardening complete | Kasun + Kithsara |
| 29 | Final regression test — PASS | Yoshadhi |
| 30 | `v2.0.0` Final Production Release | Kasun |
| 30 | Final Project Report Submitted | Vedeshen |

---

### Logbook Entry Guide (All 30 Entries)

Each team member should structure their weekly logbook entry as follows:

```
Logbook Entry [N] — Week [N]
Date Range: [Start Date] to [End Date]
Phase: [1A / 1B / 1C / 2A / 2B / 2C]
Theme: [Week's logbook theme above]

1. PLANNED TASKS (from this WBS document)
   - Task 1
   - Task 2 ...

2. COMPLETED TASKS
   - What was actually completed (may differ from plan)

3. TECHNICAL EVIDENCE
   - Code commits (link to GitHub commit)
   - Screenshots (API response, UI, terminal output)
   - Documents produced (link to file)

4. CHALLENGES ENCOUNTERED
   - What problem was faced
   - How it was investigated
   - How it was resolved (or is being escalated)

5. KEY LEARNINGS
   - Concept or skill learned this week
   - Resource consulted (official documentation, etc.)

6. NEXT WEEK PLAN
   - Preview of Week N+1 tasks
```

---

### Skills Development Matrix

| Skill/Technology | Kithsara | Chandupa | Kasun | Yoshadhi | Vedeshen |
|-----------------|----------|----------|-------|----------|----------|
| Node.js/Express | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ | — |
| React + TypeScript | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | — |
| Tailwind CSS | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | — |
| PostgreSQL / SQL | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Python / FastAPI | ⭐⭐⭐⭐⭐ | — | ⭐ | ⭐⭐ | — |
| scikit-learn / NLP | ⭐⭐⭐⭐⭐ | — | — | ⭐⭐ | ⭐ |
| Docker / DevOps | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | — |
| Testing / QA | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Requirements / BA | ⭐ | ⭐ | — | ⭐ | ⭐⭐⭐⭐⭐ |
| Technical Writing | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

*⭐ = Awareness, ⭐⭐⭐ = Competent, ⭐⭐⭐⭐⭐ = Expert by project end*

---

*End of WBS & Task Distribution Document v1.0*

---

> **Document Owner**: Vedeshen (BA)  
> **Technical Review**: Kithsara (Backend Lead)  
> **Last Updated**: May 2026  
> **Next Review**: Prior to each Phase Gate
