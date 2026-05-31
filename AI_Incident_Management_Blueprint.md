# AI-Powered Incident Management Dashboard
## Technical Blueprint & Implementation Guide
### 3rd Year University Software Engineering Project

---

> **Document Version**: 1.0  
> **Prepared for**: Kithsara, Chandupa, Kasun (Developers) | Yoshadhi (QA) | Vedeshen (BA)  
> **Classification**: Internal Project Reference — Team Confidential  
> **Date**: May 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Mechanics](#2-system-architecture--mechanics)
   - 2.1 High-Level Architecture Overview
   - 2.2 Phase 1: Core Incident Management Data Flow
   - 2.3 Phase 2: AI Analytics Engine — Async Pipeline
   - 2.4 Widget Rendering Lifecycle
   - 2.5 API Communication Contract
3. [Recommended Industry-Grade Tech Stack](#3-recommended-industry-grade-tech-stack)
   - 3.1 Full Stack Breakdown
   - 3.2 Why This Stack? Justification Matrix
   - 3.3 Evaluation Criteria Alignment
4. [Data Model & Schema Design](#4-data-model--schema-design)
5. [Personalized Learning Roadmap for Kithsara](#5-personalized-learning-roadmap-for-kithsara)
   - 5.1 Phase-by-Phase Skill Acquisition Plan
   - 5.2 Backend Logic Mastery (Node.js / Laravel)
   - 5.3 Python AI Service Integration (FastAPI)
   - 5.4 NLP & Text Similarity Deep-Dive
   - 5.5 Clustering & Predictive Scoring
   - 5.6 Official Documentation Master Index
6. [Team Responsibility Matrix](#6-team-responsibility-matrix)
7. [Development Milestones & Timeline](#7-development-milestones--timeline)
8. [Quality Assurance Strategy](#8-quality-assurance-strategy)
9. [Deployment Architecture (Docker)](#9-deployment-architecture-docker)
10. [Appendix: Code Scaffold Templates](#10-appendix-code-scaffold-templates)

---

## 1. Executive Summary

This document serves as the **single source of truth** for the design, construction, and delivery of the AI-Powered Incident Management Dashboard. The system is architected in two distinct but tightly coupled phases:

- **Phase 1** establishes a production-grade **Incident Management System (IMS)** — a structured CRUD platform capturing incident lifecycle data across seven canonical objects: *Details, Actions, Investigation, Root Cause, Controls, Review,* and *Close*.

- **Phase 2** transforms that structured data into intelligence via an **AI Analytics Layer** — a separate, independently deployable Python microservice that exposes three AI-driven widgets: Similar Incidents (NLP), Incident Clustering Map (K-Means), and Predictive Risk Scoring (Classification).

The two phases are decoupled by design and communicate exclusively through **REST APIs**, making the AI layer independently scalable, testable, and replaceable — a hallmark of enterprise microservice architecture.

---

## 2. System Architecture & Mechanics

### 2.1 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│              React + Tailwind CSS (Port 3000)                        │
│   ┌──────────────┐  ┌─────────────────┐  ┌──────────────────────┐   │
│   │  Incident    │  │   Dashboard     │  │   AI Widget Panel    │   │
│   │  CRUD Forms  │  │   Overview      │  │  (3 AI Widgets)      │   │
│   └──────┬───────┘  └────────┬────────┘  └──────────┬───────────┘   │
└──────────┼────────────────────┼─────────────────────┼───────────────┘
           │REST/JSON           │REST/JSON             │REST/JSON
           ▼                   ▼                       ▼
┌──────────────────────┐               ┌───────────────────────────────┐
│   CORE BACKEND       │               │     AI/ANALYTICS SERVICE      │
│  Node.js / Laravel   │──DB Queries──▶│       Python FastAPI          │
│     (Port 8000)      │               │         (Port 8001)           │
│                      │               │                               │
│  ┌────────────────┐  │               │  ┌─────────────────────────┐  │
│  │  Incident API  │  │               │  │  /api/similar-incidents  │  │
│  │  CRUD Routes   │  │               │  │  /api/cluster-map        │  │
│  │  Auth (JWT)    │  │               │  │  /api/risk-score         │  │
│  └────────────────┘  │               │  └─────────────────────────┘  │
└──────────┬───────────┘               └───────────────┬───────────────┘
           │                                           │
           ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE LAYER                           │
│              PostgreSQL / MySQL (Port 5432 / 3306)                   │
│         Shared database accessed by both services                    │
└─────────────────────────────────────────────────────────────────────┘
           │                                           │
           ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                             │
│          Docker Compose — All services containerised                 │
│          Nginx reverse proxy (optional for production)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Phase 1: Core Incident Management Data Flow

Phase 1 is a structured **multi-step incident lifecycle** built around 7 data objects. Each object maps to a database table and a corresponding API endpoint.

#### The 7 Canonical Objects

| # | Object | Purpose | Key Fields |
|---|--------|---------|------------|
| 1 | **Details** | Initial incident capture | title, description, severity, location, reporter_id, timestamp |
| 2 | **Actions** | Immediate response tasks | action_taken, assigned_to, due_date, status |
| 3 | **Investigation** | Fact-finding phase | findings, evidence, investigated_by, investigation_date |
| 4 | **Root Cause** | Causal analysis | root_cause_category, contributing_factors, causal_chain |
| 5 | **Controls** | Preventive measures | control_type, control_description, owner, implementation_date |
| 6 | **Review** | Management sign-off | reviewer_id, review_notes, effectiveness_rating |
| 7 | **Close** | Final closure | closure_date, closure_summary, lessons_learned, closed_by |

#### Data Flow — Step by Step

```
User fills Incident Details Form
         │
         ▼
React Form → POST /api/incidents/details
         │
         ▼ (Core Backend validates & persists)
incidents_details table ← INSERT
         │
         ▼ (Returns incident_id: 1042)
React stores incident_id in local state/context
         │
         ├──▶ POST /api/incidents/1042/actions       → incident_actions table
         ├──▶ POST /api/incidents/1042/investigation → incident_investigation table
         ├──▶ POST /api/incidents/1042/root-cause    → incident_root_cause table
         ├──▶ POST /api/incidents/1042/controls      → incident_controls table
         ├──▶ POST /api/incidents/1042/review        → incident_reviews table
         └──▶ POST /api/incidents/1042/close         → incident_closures table
                     │
                     ▼
         Incident lifecycle COMPLETE.
         Status flag updated to "CLOSED" in master incidents table.
```

> **Key Design Principle**: The `incident_id` is the foreign key that threads all 7 objects together. Every child table references this primary key. This is a **one-to-one relationship** per incident (an incident has exactly one root cause record, one closure record, etc.).

---

### 2.3 Phase 2: AI Analytics Engine — Async Pipeline

The AI service is a **separate Python process** that does NOT process data in real-time during incident creation. Instead, it follows an **asynchronous pull model**:

```
┌─────────────────────────────────────────────────────────────────┐
│              ASYNC AI PIPELINE FLOW                              │
│                                                                  │
│  1. Incident CLOSED                                              │
│       │                                                          │
│       ▼                                                          │
│  2. Core Backend fires a webhook / sets a flag in DB             │
│     (incidents.ai_processed = FALSE)                             │
│       │                                                          │
│       ▼                                                          │
│  3. FastAPI Background Task Scheduler (APScheduler)              │
│     polls DB every N minutes for unprocessed incidents           │
│       │                                                          │
│       ▼                                                          │
│  4. AI Service fetches raw text from DB:                         │
│     SELECT title, description, root_cause, lessons_learned       │
│     FROM incidents WHERE ai_processed = FALSE                    │
│       │                                                          │
│       ▼                                                          │
│  5. NLP Pipeline runs:                                           │
│     - Sentence Transformer encodes text → embeddings vector      │
│     - Embeddings stored in ai_embeddings table                   │
│     - K-Means re-fitted on full embedding matrix                 │
│     - Cluster labels stored in incidents.cluster_id              │
│     - Risk score computed via classifier → stored in             │
│       incidents.predicted_risk_score                             │
│       │                                                          │
│       ▼                                                          │
│  6. SET incidents.ai_processed = TRUE                            │
│       │                                                          │
│       ▼                                                          │
│  7. Dashboard widgets query FastAPI endpoints                    │
│     which return pre-computed results instantly                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why Asynchronous?**  
Running NLP models synchronously during incident submission would introduce unacceptable latency (Sentence Transformers can take 50–500ms per document). The async pipeline processes data in the background and serves **pre-computed results** to the dashboard, ensuring sub-100ms widget load times.

---

### 2.4 Widget Rendering Lifecycle

#### Widget 1: Similar Incidents (NLP / Sentence Embeddings)

```
User opens an Incident Detail page (incident_id: 1042)
         │
         ▼
React fires: GET /api/ai/similar-incidents?incident_id=1042&top_k=5
         │
         ▼ (FastAPI endpoint receives request)
1. Fetch embedding for incident 1042 from ai_embeddings table
         │
         ▼
2. Compute Cosine Similarity between incident 1042's vector
   and ALL other stored embeddings
   (using sklearn.metrics.pairwise.cosine_similarity)
         │
         ▼
3. Sort by similarity score (descending), return top 5
         │
         ▼
4. FastAPI returns:
   {
     "source_incident": 1042,
     "similar": [
       {"incident_id": 873, "title": "Network Outage Q3", "score": 0.94},
       {"incident_id": 651, "title": "Server Overload Event", "score": 0.89},
       ...
     ]
   }
         │
         ▼
React renders "Similar Incidents" card widget
with clickable links to each incident
```

#### Widget 2: Incident Clustering Map (K-Means)

```
User opens the Dashboard Analytics page
         │
         ▼
React fires: GET /api/ai/cluster-map
         │
         ▼ (FastAPI endpoint)
1. Fetch ALL incidents with their cluster_id and 2D coordinates
   (coordinates pre-computed via UMAP/t-SNE dimensionality reduction)
         │
         ▼
2. FastAPI returns cluster data:
   {
     "clusters": [
       {"incident_id": 1042, "x": 2.34, "y": -1.12, "cluster": 2,
        "title": "DB Failure", "severity": "HIGH"},
       ...
     ],
     "cluster_labels": {0: "Network", 1: "Security", 2: "Infrastructure"}
   }
         │
         ▼
React renders interactive scatter plot (Recharts / Chart.js / D3)
Color-coded by cluster, hoverable tooltips
```

#### Widget 3: Predictive Risk Scoring

```
User is creating a NEW incident (mid-form)
         │
         ▼
React fires: POST /api/ai/predict-risk
Body: { "title": "...", "description": "...",
        "category": "network", "department": "IT" }
         │
         ▼ (FastAPI endpoint)
1. Encode text features using trained Sentence Transformer
2. Combine with categorical features (one-hot encoded category, dept)
3. Pass combined feature vector to trained classifier
   (Random Forest or Gradient Boosting)
4. Return:
   {
     "risk_score": 78,          ← 0-100 scale
     "risk_label": "HIGH",
     "confidence": 0.85,
     "contributing_factors": ["network_category", "description_keywords"]
   }
         │
         ▼
React renders real-time risk meter on the incident form
```

---

### 2.5 API Communication Contract

#### Core Backend REST API (Node.js / Laravel)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT Authentication |
| GET | `/api/incidents` | List all incidents (paginated) |
| POST | `/api/incidents` | Create new incident |
| GET | `/api/incidents/:id` | Get full incident with all 7 objects |
| PUT | `/api/incidents/:id/status` | Update incident status |
| POST | `/api/incidents/:id/actions` | Add action record |
| POST | `/api/incidents/:id/investigation` | Add investigation record |
| POST | `/api/incidents/:id/root-cause` | Add root cause record |
| POST | `/api/incidents/:id/controls` | Add controls record |
| POST | `/api/incidents/:id/review` | Add review record |
| POST | `/api/incidents/:id/close` | Close incident |

#### AI Service REST API (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/health` | Service health check |
| GET | `/api/ai/similar-incidents` | Similar incident retrieval |
| GET | `/api/ai/cluster-map` | Full clustering data for map widget |
| POST | `/api/ai/predict-risk` | Real-time risk prediction |
| POST | `/api/ai/retrain` | Trigger model retraining (admin only) |
| GET | `/api/ai/stats` | Model performance metrics |

---

## 3. Recommended Industry-Grade Tech Stack

### 3.1 Full Stack Breakdown

```
┌────────────────────────────────────────────────────────────────┐
│                     COMPLETE TECH STACK                         │
├─────────────────┬──────────────────────────────────────────────┤
│ Layer           │ Technology                                    │
├─────────────────┼──────────────────────────────────────────────┤
│ Frontend        │ React 18 + Vite + TypeScript                  │
│ Styling         │ Tailwind CSS v3                               │
│ UI Components   │ shadcn/ui (Radix UI based)                    │
│ Charts/Viz      │ Recharts + D3.js (for cluster scatter plot)   │
│ State Mgmt      │ Zustand (lightweight) or React Query           │
│ HTTP Client     │ Axios                                         │
├─────────────────┼──────────────────────────────────────────────┤
│ Core Backend    │ Node.js + Express.js (or PHP Laravel 11)      │
│ Auth            │ JWT (jsonwebtoken) + bcrypt                   │
│ ORM             │ Prisma (Node) or Eloquent (Laravel)           │
│ Validation      │ Zod (Node) or Form Request Validation (Laravel│
├─────────────────┼──────────────────────────────────────────────┤
│ AI Service      │ Python 3.11 + FastAPI                         │
│ NLP/Embeddings  │ sentence-transformers (all-MiniLM-L6-v2)      │
│ ML/Clustering   │ scikit-learn (KMeans, RandomForest)           │
│ Data Processing │ Pandas + NumPy                                │
│ Dimensionality  │ UMAP-learn (for 2D cluster visualization)     │
│ Task Scheduling │ APScheduler (async background processing)     │
│ DB Driver       │ SQLAlchemy + asyncpg (async PostgreSQL)        │
├─────────────────┼──────────────────────────────────────────────┤
│ Database        │ PostgreSQL 16                                 │
│ Caching         │ Redis (optional, for embedding cache)         │
├─────────────────┼──────────────────────────────────────────────┤
│ DevOps          │ Docker + Docker Compose                       │
│ Reverse Proxy   │ Nginx (production)                            │
│ Version Control │ Git + GitHub (with branch protection)         │
│ API Testing     │ Postman / Bruno                               │
│ CI (optional)   │ GitHub Actions                               │
└─────────────────┴──────────────────────────────────────────────┘
```

---

### 3.2 Why This Stack? Justification Matrix

#### React + Tailwind CSS (Frontend)

| Criterion | Justification |
|-----------|---------------|
| **Industry Relevance** | React is the most demanded frontend framework globally (Stack Overflow Survey 2024: 40%+ usage). Evaluators will immediately recognise it as a production-grade choice. |
| **Component Architecture** | React's composable component model is architecturally aligned with building distinct, reusable AI widgets. Each widget becomes a self-contained React component with its own data fetching lifecycle. |
| **Tailwind CSS** | Utility-first CSS eliminates the need for custom stylesheets, dramatically speeding up UI development for a 5-person team on a deadline. |
| **Vite** | Vite provides Hot Module Replacement (HMR), making the development feedback loop near-instant. |

#### Node.js/Express or PHP Laravel (Core Backend)

| Criterion | Node.js + Express | PHP Laravel |
|-----------|------------------|-------------|
| **Performance** | Non-blocking I/O; excellent for high-concurrency API routes | Synchronous but optimised; sufficient for university-scale load |
| **Team Familiarity** | If your team knows JavaScript, this extends that knowledge to the server | If your team has PHP experience, Laravel's conventions reduce cognitive overhead |
| **ORM Quality** | Prisma ORM is exceptional — type-safe, auto-migration, schema-first | Eloquent is mature, intuitive, and well-documented |
| **University Credibility** | Demonstrates polyglot architecture awareness | Demonstrates understanding of MVC patterns |
| **Recommendation** | ✅ **Prefer Node.js + Express** if team is JavaScript-comfortable | Use Laravel if the team has prior PHP experience |

#### Python FastAPI (AI Service)

| Criterion | Justification |
|-----------|---------------|
| **Python Ecosystem** | ALL mature ML libraries (scikit-learn, sentence-transformers, UMAP, Pandas) are Python-native. Attempting ML in Node.js would require immature wrappers. |
| **FastAPI Performance** | FastAPI is built on Starlette/Uvicorn (ASGI). It is significantly faster than Flask and Django REST Framework for API serving. |
| **Auto Documentation** | FastAPI auto-generates Swagger UI at `/docs` and ReDoc at `/redoc` — this is invaluable for your QA engineer (Yoshadhi) to test AI endpoints without writing test clients. |
| **Type Safety** | FastAPI uses Pydantic models for request/response validation — catches data contract errors at the API boundary, not in the ML pipeline. |
| **Async Support** | Native `async/await` support enables concurrent request handling and non-blocking background tasks (for the async AI pipeline). |

#### PostgreSQL (Database)

| Criterion | Justification |
|-----------|---------------|
| **Vector Support** | The `pgvector` extension allows storing sentence embeddings *directly in the database*, eliminating the need for a separate vector store for university-scale datasets. |
| **JSONB Support** | Complex root cause data and investigation findings can be stored as JSONB for flexibility without sacrificing query performance. |
| **Reliability** | PostgreSQL's ACID compliance guarantees that your 7-object incident lifecycle data remains consistent even if a step fails mid-transaction. |
| **Free & Open Source** | No licensing costs — appropriate for an academic project. |

#### Docker (Deployment)

| Criterion | Justification |
|-----------|---------------|
| **Reproducibility** | "Works on my machine" is eliminated. Every team member runs an identical environment via `docker-compose up`. |
| **Service Isolation** | The Core Backend, AI Service, and Database each run in isolated containers — preventing dependency conflicts (e.g., Python 3.11 for AI vs Node 20 for backend). |
| **Evaluation Presentation** | A Dockerized application demonstrates DevOps maturity — a distinction-level indicator for most university rubrics. |
| **Industry Standard** | Docker Compose is how most startups and enterprises run multi-service applications locally and in staging environments. |

---

### 3.3 Evaluation Criteria Alignment

This stack is specifically chosen to tick the boxes that university evaluators look for:

| Evaluation Criterion | How This Stack Addresses It |
|---------------------|----------------------------|
| **Architectural Complexity** | Microservice architecture (3 distinct services) demonstrates advanced system design |
| **AI/ML Integration** | Genuine NLP + ML implementation (not ChatGPT API wrappers) — demonstrates deep understanding |
| **Database Design** | Normalised relational schema with 9+ tables, foreign keys, and proper indexing |
| **API Design** | RESTful API with proper HTTP verbs, status codes, and JSON schema validation |
| **DevOps Awareness** | Docker containerisation demonstrates production deployment knowledge |
| **Code Quality** | TypeScript (frontend), Pydantic models (AI backend) show type safety awareness |
| **Documentation** | FastAPI auto-docs show professional API documentation practices |

---

## 4. Data Model & Schema Design

### Master Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50) DEFAULT 'staff',  -- admin, manager, staff
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Master Incidents Table (Phase 1 — Object 1: Details)
CREATE TABLE incidents (
    id                    SERIAL PRIMARY KEY,
    title                 VARCHAR(255) NOT NULL,
    description           TEXT NOT NULL,
    severity              VARCHAR(20) NOT NULL,  -- LOW, MEDIUM, HIGH, CRITICAL
    category              VARCHAR(100),
    location              VARCHAR(200),
    department            VARCHAR(100),
    reported_by           INT REFERENCES users(id),
    status                VARCHAR(50) DEFAULT 'OPEN',
    -- AI-managed columns
    ai_processed          BOOLEAN DEFAULT FALSE,
    predicted_risk_score  FLOAT,
    cluster_id            INT,
    -- Timestamps
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- Object 2: Actions
CREATE TABLE incident_actions (
    id              SERIAL PRIMARY KEY,
    incident_id     INT REFERENCES incidents(id) ON DELETE CASCADE,
    action_taken    TEXT NOT NULL,
    assigned_to     INT REFERENCES users(id),
    priority        VARCHAR(20),
    due_date        DATE,
    status          VARCHAR(50) DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Object 3: Investigation
CREATE TABLE incident_investigations (
    id                  SERIAL PRIMARY KEY,
    incident_id         INT REFERENCES incidents(id) ON DELETE CASCADE,
    findings            TEXT,
    evidence            TEXT,
    investigated_by     INT REFERENCES users(id),
    investigation_date  DATE,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Object 4: Root Cause
CREATE TABLE incident_root_causes (
    id                    SERIAL PRIMARY KEY,
    incident_id           INT REFERENCES incidents(id) ON DELETE CASCADE,
    root_cause_category   VARCHAR(100),  -- Human Error, System Failure, etc.
    description           TEXT NOT NULL,
    contributing_factors  TEXT,
    causal_chain          TEXT,
    created_at            TIMESTAMP DEFAULT NOW()
);

-- Object 5: Controls
CREATE TABLE incident_controls (
    id                    SERIAL PRIMARY KEY,
    incident_id           INT REFERENCES incidents(id) ON DELETE CASCADE,
    control_type          VARCHAR(100),  -- Preventive, Detective, Corrective
    description           TEXT NOT NULL,
    owner                 INT REFERENCES users(id),
    implementation_date   DATE,
    status                VARCHAR(50) DEFAULT 'PLANNED',
    created_at            TIMESTAMP DEFAULT NOW()
);

-- Object 6: Review
CREATE TABLE incident_reviews (
    id                   SERIAL PRIMARY KEY,
    incident_id          INT REFERENCES incidents(id) ON DELETE CASCADE,
    reviewer_id          INT REFERENCES users(id),
    review_notes         TEXT,
    effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
    review_date          DATE,
    created_at           TIMESTAMP DEFAULT NOW()
);

-- Object 7: Close
CREATE TABLE incident_closures (
    id               SERIAL PRIMARY KEY,
    incident_id      INT REFERENCES incidents(id) ON DELETE CASCADE,
    closure_summary  TEXT NOT NULL,
    lessons_learned  TEXT,
    closed_by        INT REFERENCES users(id),
    closure_date     DATE NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- AI Embeddings Table (Phase 2 — managed by FastAPI service)
-- Requires pgvector extension: CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE ai_embeddings (
    id              SERIAL PRIMARY KEY,
    incident_id     INT UNIQUE REFERENCES incidents(id) ON DELETE CASCADE,
    embedding       vector(384),    -- 384-dim for all-MiniLM-L6-v2
    umap_x          FLOAT,          -- 2D reduced coordinate for cluster map
    umap_y          FLOAT,
    text_hash       VARCHAR(64),    -- SHA-256 of source text (for cache invalidation)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON ai_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## 5. Personalized Learning Roadmap for Kithsara

This section is written **specifically for you** as a developer responsible for backend logic, Python AI API integration, and the data science components. This is a documentation-first roadmap — every resource links to official technical documentation.

---

### 5.1 Phase-by-Phase Skill Acquisition Plan

```
MONTH 1 — Foundation Building
├── Week 1-2: Node.js/Express or Laravel fundamentals (REST API design)
├── Week 3:   PostgreSQL + ORM (Prisma or Eloquent)
└── Week 4:   JWT Auth + Middleware patterns

MONTH 2 — Python AI Service
├── Week 1:   Python fundamentals for ML (if not already strong)
├── Week 2:   FastAPI deep-dive (routes, Pydantic, async, background tasks)
├── Week 3:   Pandas + NumPy for data manipulation
└── Week 4:   scikit-learn core concepts (pipelines, preprocessing, metrics)

MONTH 3 — AI Feature Implementation
├── Week 1:   Sentence Transformers + Cosine Similarity (Widget 1)
├── Week 2:   K-Means Clustering + UMAP (Widget 2)
├── Week 3:   Classification / Risk Scoring (Widget 3)
└── Week 4:   Integration testing + Docker deployment

MONTH 4 — Polish & Presentation
├── Week 1-2: Performance optimisation + error handling
├── Week 3:   Documentation + API testing
└── Week 4:   Demo preparation
```

---

### 5.2 Backend Logic Mastery (Node.js / Express)

#### Concept 1: RESTful API Design with Express

**What to Learn**: How to structure routes, controllers, and middleware for the 7-object incident API.

**Official Documentation**:
- Express.js Guide: https://expressjs.com/en/guide/routing.html
- Express Middleware: https://expressjs.com/en/guide/using-middleware.html

**Key Patterns to Implement**:

```javascript
// routes/incidents.js — Typical route structure
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const incidentController = require('../controllers/incidentController');

// All routes require authentication
router.use(authenticate);

// Core incident CRUD
router.get('/',           incidentController.list);
router.post('/',          incidentController.create);
router.get('/:id',        incidentController.getById);

// 7-Object lifecycle routes
router.post('/:id/actions',        incidentController.addAction);
router.post('/:id/investigation',  incidentController.addInvestigation);
router.post('/:id/root-cause',     incidentController.addRootCause);
router.post('/:id/controls',       incidentController.addControls);
router.post('/:id/review',         incidentController.addReview);
router.post('/:id/close',          incidentController.closeIncident);

module.exports = router;
```

#### Concept 2: Prisma ORM (Database Access)

**What to Learn**: Schema definition, migrations, and type-safe database queries.

**Official Documentation**: https://www.prisma.io/docs/getting-started

```javascript
// Using Prisma to fetch a full incident with all related objects
const incident = await prisma.incidents.findUnique({
  where: { id: incidentId },
  include: {
    incident_actions: true,
    incident_investigations: true,
    incident_root_causes: true,
    incident_controls: true,
    incident_reviews: true,
    incident_closures: true,
    reported_by_user: { select: { name: true, email: true } }
  }
});
```

#### Concept 3: JWT Authentication Middleware

**Official Documentation**:
- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken#readme
- bcrypt: https://www.npmjs.com/package/bcryptjs

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

#### Concept 4: Calling the Python AI Service from Node.js

**This is the critical integration point.** The Core Backend acts as a **proxy** for AI requests from the frontend — OR the frontend calls the AI service directly (CORS-permitting). Both are valid. Here's the proxy pattern:

```javascript
// In your Node.js backend — proxy pattern using axios
const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8001';

// When an incident is CLOSED, notify the AI service to process it
const notifyAIService = async (incidentId) => {
  try {
    await axios.post(`${AI_SERVICE_URL}/api/ai/process`, {
      incident_id: incidentId
    });
  } catch (err) {
    // Non-fatal — log but don't fail the close operation
    console.error('AI service notification failed:', err.message);
  }
};
```

---

### 5.3 Python AI Service Integration (FastAPI)

**Official FastAPI Documentation**: https://fastapi.tiangolo.com/

FastAPI is the single most important technology for you to master in Phase 2.

#### Core FastAPI Concepts to Master

**1. Application Structure**

```
ai_service/
├── main.py              ← FastAPI app entry point
├── routers/
│   ├── similar.py       ← /api/ai/similar-incidents
│   ├── clustering.py    ← /api/ai/cluster-map
│   └── risk.py          ← /api/ai/predict-risk
├── services/
│   ├── embeddings.py    ← Sentence Transformer logic
│   ├── clustering.py    ← K-Means + UMAP logic
│   └── classifier.py    ← Risk scoring logic
├── models/
│   └── schemas.py       ← Pydantic request/response models
├── db/
│   └── database.py      ← SQLAlchemy async database connection
└── scheduler.py         ← APScheduler background tasks
```

**2. Pydantic Models (Request/Response Validation)**

```python
# models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

class SimilarIncidentRequest(BaseModel):
    incident_id: int = Field(..., description="The source incident ID")
    top_k: int = Field(default=5, ge=1, le=20)

class SimilarIncidentResult(BaseModel):
    incident_id: int
    title: str
    similarity_score: float
    severity: str

class SimilarIncidentsResponse(BaseModel):
    source_incident_id: int
    similar_incidents: List[SimilarIncidentResult]
    processing_time_ms: float

class RiskPredictionRequest(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=10)
    category: Optional[str] = None
    department: Optional[str] = None

class RiskPredictionResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_label: str   # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
```

**3. Router Pattern**

```python
# routers/similar.py
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SimilarIncidentRequest, SimilarIncidentsResponse
from services.embeddings import find_similar_incidents
import time

router = APIRouter(prefix="/api/ai", tags=["similarity"])

@router.get("/similar-incidents", response_model=SimilarIncidentsResponse)
async def get_similar_incidents(
    incident_id: int,
    top_k: int = 5
):
    start = time.time()
    
    results = await find_similar_incidents(incident_id, top_k)
    if results is None:
        raise HTTPException(
            status_code=404,
            detail=f"Incident {incident_id} not found or not yet processed"
        )
    
    return SimilarIncidentsResponse(
        source_incident_id=incident_id,
        similar_incidents=results,
        processing_time_ms=(time.time() - start) * 1000
    )
```

**4. Background Tasks with APScheduler**

```python
# scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.embeddings import process_unprocessed_incidents

scheduler = AsyncIOScheduler()

def setup_scheduler():
    # Run every 5 minutes
    scheduler.add_job(
        process_unprocessed_incidents,
        'interval',
        minutes=5,
        id='process_incidents'
    )
    scheduler.start()

# In main.py — attach to FastAPI startup
@app.on_event("startup")
async def startup_event():
    setup_scheduler()
```

**Key Documentation Pages to Read**:
- Path Parameters: https://fastapi.tiangolo.com/tutorial/path-params/
- Request Body (Pydantic): https://fastapi.tiangolo.com/tutorial/body/
- Background Tasks: https://fastapi.tiangolo.com/tutorial/background-tasks/
- SQL (Databases): https://fastapi.tiangolo.com/tutorial/sql-databases/
- Async SQL with SQLAlchemy: https://fastapi.tiangolo.com/how-to/async-sql-databases/

---

### 5.4 NLP & Text Similarity Deep-Dive

This is the heart of Widget 1. The goal is to take raw incident text and convert it into mathematical vectors so that "similarity" becomes a computable distance measure.

#### Step 1: Understanding Sentence Embeddings vs TF-IDF

| Approach | How It Works | When to Use | Quality |
|----------|-------------|-------------|---------|
| **TF-IDF** | Bag-of-words; counts word frequencies, down-weights common words | Fast, no GPU, works with small datasets | ⭐⭐⭐ (keyword matching only) |
| **Sentence Transformers** | Deep learning; understands semantic meaning | Datasets >50 records, when semantic understanding matters | ⭐⭐⭐⭐⭐ |

**Recommendation**: Use **Sentence Transformers** (`all-MiniLM-L6-v2` model). It produces 384-dimensional embeddings and runs comfortably on CPU. TF-IDF can be a fallback for early development.

**Official Documentation**: https://www.sbert.net/docs/quickstart.html

#### Step 2: Implementing the Embedding Service

```python
# services/embeddings.py
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from db.database import get_db

# Load model once at startup — this is expensive (~80MB model)
model = SentenceTransformer('all-MiniLM-L6-v2')

def create_incident_text(incident: dict) -> str:
    """
    Combine relevant text fields into a single string for embedding.
    Weighting strategy: title is repeated for emphasis.
    """
    parts = [
        f"Title: {incident.get('title', '')}",
        f"Title: {incident.get('title', '')}",      # doubled for weight
        f"Description: {incident.get('description', '')}",
        f"Root Cause: {incident.get('root_cause', '')}",
        f"Category: {incident.get('category', '')}",
        f"Lessons Learned: {incident.get('lessons_learned', '')}",
    ]
    return " | ".join([p for p in parts if p.split(": ")[1]])

async def generate_embedding(text: str) -> np.ndarray:
    """Generate a 384-dimensional embedding vector for a text string."""
    # SentenceTransformer.encode() returns numpy array
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding

async def find_similar_incidents(source_incident_id: int, top_k: int = 5):
    """
    Find the top_k most similar incidents to the source incident
    using cosine similarity on pre-computed embeddings.
    """
    async with get_db() as db:
        # 1. Get source embedding
        source = await db.fetchrow(
            "SELECT embedding FROM ai_embeddings WHERE incident_id = $1",
            source_incident_id
        )
        if not source:
            return None

        # 2. Get ALL other embeddings
        all_embeddings = await db.fetch(
            """
            SELECT ae.incident_id, ae.embedding, i.title, i.severity
            FROM ai_embeddings ae
            JOIN incidents i ON i.id = ae.incident_id
            WHERE ae.incident_id != $1
            """,
            source_incident_id
        )

        if not all_embeddings:
            return []

        # 3. Compute cosine similarity
        source_vec = np.array(source['embedding']).reshape(1, -1)
        candidate_vecs = np.array([r['embedding'] for r in all_embeddings])
        similarities = cosine_similarity(source_vec, candidate_vecs)[0]

        # 4. Sort and return top_k
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [
            {
                "incident_id": all_embeddings[i]['incident_id'],
                "title": all_embeddings[i]['title'],
                "severity": all_embeddings[i]['severity'],
                "similarity_score": float(similarities[i])
            }
            for i in top_indices
        ]
```

**Key scikit-learn Documentation to Read**:
- `cosine_similarity`: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html
- `TfidfVectorizer` (fallback): https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html

---

### 5.5 Clustering & Predictive Scoring

#### Widget 2: K-Means Clustering

**Goal**: Group all incidents into K clusters based on their semantic similarity. Each cluster represents a "theme" (e.g., Network Issues, Security Breaches, Infrastructure Failures).

**Official scikit-learn Documentation**:
- KMeans: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
- Cluster User Guide: https://scikit-learn.org/stable/modules/clustering.html

```python
# services/clustering.py
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import umap
import numpy as np
import pickle
import os

MODEL_PATH = "models/kmeans_model.pkl"

def find_optimal_k(embeddings: np.ndarray, k_range=(2, 10)) -> int:
    """
    Use Silhouette Score to find the optimal number of clusters.
    The elbow method is visual; silhouette score is programmatic.
    """
    best_k = k_range[0]
    best_score = -1

    for k in range(k_range[0], min(k_range[1] + 1, len(embeddings))):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(embeddings)
        score = silhouette_score(embeddings, labels)
        if score > best_score:
            best_score = score
            best_k = k

    return best_k

async def refit_clustering_model():
    """
    Refit K-Means on ALL incident embeddings.
    Called by the background scheduler after new incidents are processed.
    """
    # 1. Load all embeddings from DB
    embeddings_data = await load_all_embeddings_from_db()
    if len(embeddings_data) < 4:   # need minimum data points
        return

    embeddings_matrix = np.array([d['embedding'] for d in embeddings_data])
    incident_ids = [d['incident_id'] for d in embeddings_data]

    # 2. Find optimal K
    optimal_k = find_optimal_k(embeddings_matrix)

    # 3. Fit K-Means
    kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init='auto')
    cluster_labels = kmeans.fit_predict(embeddings_matrix)

    # 4. Reduce to 2D for visualization using UMAP
    # UMAP doc: https://umap-learn.readthedocs.io/en/latest/
    reducer = umap.UMAP(n_components=2, random_state=42, n_neighbors=15)
    coords_2d = reducer.fit_transform(embeddings_matrix)

    # 5. Save cluster assignments back to DB
    async with get_db() as db:
        for i, incident_id in enumerate(incident_ids):
            await db.execute(
                """
                UPDATE incidents SET cluster_id = $1 WHERE id = $2;
                UPDATE ai_embeddings
                  SET umap_x = $3, umap_y = $4
                  WHERE incident_id = $2;
                """,
                int(cluster_labels[i]), incident_id,
                float(coords_2d[i][0]), float(coords_2d[i][1])
            )

    # 6. Persist the trained K-Means model to disk
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(kmeans, f)

    print(f"✅ K-Means refitted: {optimal_k} clusters, {len(incident_ids)} incidents")
```

**UMAP Documentation**: https://umap-learn.readthedocs.io/en/latest/basic_usage.html

---

#### Widget 3: Predictive Risk Scoring

**Goal**: Given a NEW incident's text and metadata, predict its risk level (0–100 score) before it is formally assessed.

**Training Strategy**: Use closed incidents where the human-assigned severity is the ground truth label.

```python
# services/classifier.py
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
import numpy as np
import pandas as pd
import pickle

CLASSIFIER_PATH = "models/risk_classifier.pkl"
SEVERITY_TO_SCORE = {"LOW": 25, "MEDIUM": 50, "HIGH": 75, "CRITICAL": 95}

async def train_risk_classifier():
    """
    Train a risk classifier using historical closed incidents.
    Features: sentence embeddings + one-hot encoded categorical features.
    Target: severity (LOW/MEDIUM/HIGH/CRITICAL).
    """
    # 1. Load closed incidents with embeddings from DB
    closed_incidents = await load_closed_incidents_with_embeddings()
    if len(closed_incidents) < 20:
        print("⚠️  Insufficient training data. Need at least 20 closed incidents.")
        return

    # 2. Build feature matrix
    df = pd.DataFrame(closed_incidents)

    # Text embedding features (384-dimensional)
    X_embeddings = np.vstack(df['embedding'].values)

    # Categorical features (one-hot encoded)
    X_categorical = pd.get_dummies(
        df[['category', 'department']],
        prefix=['cat', 'dept']
    ).values

    # Combine all features
    X = np.hstack([X_embeddings, X_categorical])

    # 3. Encode target labels
    le = LabelEncoder()
    y = le.fit_transform(df['severity'])  # LOW=0, MEDIUM=1, HIGH=2, CRITICAL=3

    # 4. Train classifier
    clf = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42
    )
    clf.fit(X, y)

    # 5. Cross-validation score (important for QA report)
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
    print(f"✅ Classifier trained. CV Accuracy: {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")

    # 6. Save model + encoder + feature columns
    model_bundle = {
        'classifier': clf,
        'label_encoder': le,
        'categorical_columns': pd.get_dummies(df[['category', 'department']]).columns.tolist()
    }
    with open(CLASSIFIER_PATH, 'wb') as f:
        pickle.dump(model_bundle, f)

    return cv_scores.mean()


async def predict_risk(title: str, description: str,
                       category: str = None, department: str = None) -> dict:
    """Predict risk for a new incident."""
    # Load pre-trained model
    with open(CLASSIFIER_PATH, 'rb') as f:
        bundle = pickle.load(f)

    clf = bundle['classifier']
    le = bundle['label_encoder']

    # Generate embedding for input text
    text = f"Title: {title} | Description: {description}"
    embedding = model.encode(text, normalize_embeddings=True).reshape(1, -1)

    # Build categorical features (matching training columns)
    cat_data = pd.DataFrame([{'category': category, 'department': department}])
    cat_features = pd.get_dummies(cat_data).reindex(
        columns=bundle['categorical_columns'], fill_value=0
    ).values

    # Combine
    X = np.hstack([embedding, cat_features])

    # Predict
    proba = clf.predict_proba(X)[0]
    predicted_class_idx = np.argmax(proba)
    predicted_severity = le.inverse_transform([predicted_class_idx])[0]
    confidence = float(proba[predicted_class_idx])
    risk_score = SEVERITY_TO_SCORE[predicted_severity]

    return {
        "risk_score": risk_score,
        "risk_label": predicted_severity,
        "confidence": confidence,
    }
```

**Official Documentation**:
- `RandomForestClassifier`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- `GradientBoostingClassifier`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html
- `cross_val_score`: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_score.html
- Pandas `get_dummies`: https://pandas.pydata.org/docs/reference/api/pandas.get_dummies.html

---

### 5.6 Official Documentation Master Index

Bookmark these pages. They are your primary learning resources.

#### Backend (Node.js / Express)

| Resource | URL | Priority |
|----------|-----|----------|
| Express.js Official Guide | https://expressjs.com/en/guide/routing.html | 🔴 CRITICAL |
| Prisma Getting Started | https://www.prisma.io/docs/getting-started | 🔴 CRITICAL |
| jsonwebtoken (JWT) | https://www.npmjs.com/package/jsonwebtoken | 🟠 HIGH |
| Node.js Official Docs | https://nodejs.org/en/docs | 🟡 MEDIUM |

#### AI Service (FastAPI + Python)

| Resource | URL | Priority |
|----------|-----|----------|
| FastAPI Tutorial (all pages) | https://fastapi.tiangolo.com/tutorial/ | 🔴 CRITICAL |
| FastAPI Advanced Guide | https://fastapi.tiangolo.com/advanced/ | 🟠 HIGH |
| Pydantic V2 Docs | https://docs.pydantic.dev/latest/ | 🟠 HIGH |
| SQLAlchemy Async | https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html | 🟠 HIGH |
| APScheduler Docs | https://apscheduler.readthedocs.io/en/stable/ | 🟡 MEDIUM |

#### NLP & Machine Learning

| Resource | URL | Priority |
|----------|-----|----------|
| Sentence Transformers Docs | https://www.sbert.net/docs/quickstart.html | 🔴 CRITICAL |
| scikit-learn User Guide | https://scikit-learn.org/stable/user_guide.html | 🔴 CRITICAL |
| scikit-learn KMeans | https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html | 🔴 CRITICAL |
| scikit-learn cosine_similarity | https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html | 🔴 CRITICAL |
| Pandas 10-min Tutorial | https://pandas.pydata.org/docs/user_guide/10min.html | 🟠 HIGH |
| Pandas Full API Reference | https://pandas.pydata.org/docs/reference/index.html | 🟠 HIGH |
| NumPy Fundamentals | https://numpy.org/doc/stable/user/basics.html | 🟠 HIGH |
| UMAP Documentation | https://umap-learn.readthedocs.io/en/latest/ | 🟡 MEDIUM |

#### Database & Infrastructure

| Resource | URL | Priority |
|----------|-----|----------|
| pgvector Extension | https://github.com/pgvector/pgvector | 🔴 CRITICAL |
| PostgreSQL Official Docs | https://www.postgresql.org/docs/ | 🟠 HIGH |
| Docker Compose Reference | https://docs.docker.com/compose/ | 🟠 HIGH |
| Docker Getting Started | https://docs.docker.com/get-started/ | 🟡 MEDIUM |

---

## 6. Team Responsibility Matrix

| Component | Kithsara | Chandupa | Kasun | Yoshadhi (QA) | Vedeshen (BA) |
|-----------|----------|----------|-------|----------------|----------------|
| **Requirements & ERD** | Review | Review | Review | Review | ✅ Lead |
| **Database Schema** | ✅ Lead | Support | Support | Verify | Review |
| **Core Backend API** | ✅ Lead | ✅ Co-lead | Support | Test | — |
| **JWT Auth** | ✅ Lead | — | — | Test | — |
| **FastAPI AI Service** | ✅ Lead | — | Support | Test | — |
| **NLP Embeddings** | ✅ Lead | — | — | Test | — |
| **K-Means Clustering** | ✅ Lead | — | Support | Test | — |
| **Risk Classifier** | ✅ Lead | — | Support | Test | — |
| **React Frontend** | Support | ✅ Lead | ✅ Co-lead | Test | Review |
| **AI Widget UI** | Review | ✅ Lead | Support | Test | — |
| **Docker Setup** | ✅ Lead | Support | — | Verify | — |
| **API Test Suite** | Support | — | — | ✅ Lead | — |
| **UI/UX Testing** | — | — | — | ✅ Lead | Review |
| **User Documentation** | — | — | — | Support | ✅ Lead |
| **Demo Preparation** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |

---

## 7. Development Milestones & Timeline

### Sprint Structure (4-Week Sprints)

#### Sprint 1 — Infrastructure & Core Backend (Weeks 1–4)
- [ ] Repository setup (Git branching strategy: `main`, `dev`, `feature/*`)
- [ ] Docker Compose configuration (PostgreSQL + Node.js + Python containers)
- [ ] Database schema implementation & migrations
- [ ] JWT Auth endpoints (register, login, refresh)
- [ ] Incidents CRUD API (Phase 1 core — Object 1: Details)
- [ ] Postman test collection setup

#### Sprint 2 — Full Lifecycle & Frontend Foundation (Weeks 5–8)
- [ ] Implement all 7 object API endpoints
- [ ] React project scaffold (Vite + TypeScript + Tailwind)
- [ ] React Router setup + protected routes
- [ ] Incident form components (multi-step wizard for 7 objects)
- [ ] Dashboard overview page (list view)

#### Sprint 3 — AI Service Implementation (Weeks 9–12)
- [ ] FastAPI project scaffold
- [ ] Sentence Transformer embedding pipeline
- [ ] pgvector integration + embedding storage
- [ ] Async background scheduler (APScheduler)
- [ ] Similar Incidents endpoint (`/api/ai/similar-incidents`)
- [ ] K-Means clustering + UMAP 2D reduction
- [ ] Cluster Map endpoint (`/api/ai/cluster-map`)
- [ ] Risk Classifier training pipeline

#### Sprint 4 — Widget Integration & Polish (Weeks 13–16)
- [ ] React AI Widget Panel (3 widgets)
- [ ] Scatter plot visualization (Recharts / D3)
- [ ] Risk score meter UI component
- [ ] Similar incidents cards component
- [ ] End-to-end integration testing
- [ ] Docker production build
- [ ] Performance testing & optimization
- [ ] Final demo preparation

---

## 8. Quality Assurance Strategy

*Guidance for Yoshadhi (QA Engineer)*

### Testing Pyramid

```
         ▲
        /│\      E2E Tests (Cypress / Playwright)
       / │ \     Full user workflow: Create → Close → Widget renders
      /   │  \
     /─────────\  Integration Tests
    /   API     \  Test each REST endpoint with Postman/Newman
   /─────────────\
  /  Unit Tests   \ Test individual functions (validator, embedding, scorer)
 /─────────────────\
```

### Specific Test Cases by Component

#### Core Backend API Tests

```
POST /api/incidents
  ✅ Valid payload → 201 Created with incident_id
  ❌ Missing required fields → 400 Bad Request with field errors
  ❌ Unauthenticated → 401 Unauthorized

POST /api/incidents/:id/close
  ✅ Valid closure with all required fields → 200 + status = CLOSED
  ❌ Already closed incident → 409 Conflict
```

#### AI Service Tests

```
GET /api/ai/similar-incidents?incident_id=X&top_k=5
  ✅ Valid processed incident → 200 + array of 5 results
  ✅ Similarity scores are between 0 and 1
  ✅ Source incident does not appear in results
  ❌ Non-existent incident_id → 404
  ❌ Incident not yet AI-processed → 404

POST /api/ai/predict-risk
  ✅ Valid text input → 200 + risk_score between 0-100
  ✅ risk_label is one of: LOW, MEDIUM, HIGH, CRITICAL
  ✅ confidence is between 0 and 1
  ❌ title shorter than 5 chars → 422 Validation Error
```

#### AI Quality Metrics to Document

For your test report, run these metrics on the trained models:

| Metric | How to Measure | Acceptable Threshold |
|--------|---------------|---------------------|
| Classifier Accuracy | `cross_val_score` (5-fold) | > 70% |
| Silhouette Score | `silhouette_score` on clusters | > 0.3 |
| Similarity Relevance | Manual inspection: top-5 results make sense | Qualitative |
| API Response Time | `/similar-incidents` end-to-end | < 200ms |

---

## 9. Deployment Architecture (Docker)

### docker-compose.yml

```yaml
version: '3.8'

services:
  # ── DATABASE ─────────────────────────────────────────────────────────
  postgres:
    image: pgvector/pgvector:pg16   # PostgreSQL 16 with pgvector
    container_name: ims_postgres
    environment:
      POSTGRES_DB: incident_management
      POSTGRES_USER: ims_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ims_user -d incident_management"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── CORE BACKEND (Node.js) ────────────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ims_backend
    environment:
      DATABASE_URL: postgresql://ims_user:${POSTGRES_PASSWORD}@postgres:5432/incident_management
      JWT_SECRET: ${JWT_SECRET}
      AI_SERVICE_URL: http://ai-service:8001
      NODE_ENV: development
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  # ── AI/ANALYTICS SERVICE (Python FastAPI) ────────────────────────────
  ai-service:
    build:
      context: ./ai_service
      dockerfile: Dockerfile
    container_name: ims_ai_service
    environment:
      DATABASE_URL: postgresql+asyncpg://ims_user:${POSTGRES_PASSWORD}@postgres:5432/incident_management
      MODEL_CACHE_DIR: /app/models
    ports:
      - "8001:8001"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./ai_service:/app
      - ai_models:/app/models   # persist trained models across restarts

  # ── FRONTEND (React + Vite) ───────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: ims_frontend
    environment:
      VITE_API_URL: http://localhost:8000
      VITE_AI_API_URL: http://localhost:8001
    ports:
      - "3000:3000"
    depends_on:
      - backend
      - ai-service
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  ai_models:
```

### Python AI Service Dockerfile

```dockerfile
# ai_service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the sentence transformer model
RUN python -c "from sentence_transformers import SentenceTransformer; \
               SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

### Python requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
pydantic==2.7.0
sentence-transformers==2.7.0
scikit-learn==1.4.2
pandas==2.2.2
numpy==1.26.4
umap-learn==0.5.6
apscheduler==3.10.4
httpx==0.27.0
python-dotenv==1.0.1
```

---

## 10. Appendix: Code Scaffold Templates

### Project Folder Structure

```
incident-management-system/
├── docker-compose.yml
├── .env                          ← environment variables (never commit!)
├── .gitignore
├── README.md
│
├── backend/                      ← Node.js / Express
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js              ← Express app entry
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── incidents.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── incidentController.js
│   │   └── validators/
│   │       └── incidentValidator.js
│   └── prisma/
│       └── schema.prisma
│
├── ai_service/                   ← Python FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── routers/
│   │   ├── similar.py
│   │   ├── clustering.py
│   │   └── risk.py
│   ├── services/
│   │   ├── embeddings.py
│   │   ├── clustering.py
│   │   └── classifier.py
│   ├── models/
│   │   └── schemas.py
│   ├── db/
│   │   └── database.py
│   └── scheduler.py
│
├── frontend/                     ← React + Vite + Tailwind
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   ├── incidentsApi.ts
│   │   │   └── aiApi.ts
│   │   ├── components/
│   │   │   ├── incidents/
│   │   │   │   ├── IncidentForm.tsx
│   │   │   │   └── IncidentList.tsx
│   │   │   └── ai-widgets/
│   │   │       ├── SimilarIncidentsWidget.tsx
│   │   │       ├── ClusterMapWidget.tsx
│   │   │       └── RiskScoreWidget.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── IncidentDetail.tsx
│   │   │   └── CreateIncident.tsx
│   │   └── store/
│   │       └── useIncidentStore.ts
│
└── database/
    └── init.sql                  ← Initial schema + seed data
```

---

### FastAPI main.py Entry Point

```python
# ai_service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import similar, clustering, risk
from scheduler import setup_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 AI Service starting up...")
    setup_scheduler()
    yield
    # Shutdown
    print("🛑 AI Service shutting down...")

app = FastAPI(
    title="IMS AI Analytics Service",
    description="AI-powered analytics for the Incident Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow frontend to call this service directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(similar.router)
app.include_router(clustering.router)
app.include_router(risk.router)

@app.get("/api/ai/health")
async def health_check():
    return {"status": "healthy", "service": "AI Analytics Service"}
```

---

*End of Technical Blueprint v1.0*

---

> **Document Maintained by**: Kithsara (Lead Engineer)  
> **Last Updated**: May 2026  
> **Next Review**: Prior to Sprint 3 kickoff
