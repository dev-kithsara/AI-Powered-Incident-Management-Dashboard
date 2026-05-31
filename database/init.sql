CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  UNIQUE NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        VARCHAR(20)   NOT NULL DEFAULT 'staff',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Incidents ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id                    SERIAL PRIMARY KEY,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT         NOT NULL,
  severity              VARCHAR(20)  NOT NULL,
  category              VARCHAR(100),
  location              VARCHAR(200),
  department            VARCHAR(100),
  reported_by           INT          REFERENCES users(id),
  status                VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
  ai_processed          BOOLEAN      NOT NULL DEFAULT FALSE,
  predicted_risk_score  FLOAT,
  cluster_id            INT,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Actions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_actions (
  id            SERIAL PRIMARY KEY,
  incident_id   INT          NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  action_taken  TEXT         NOT NULL,
  assigned_to   INT          REFERENCES users(id),
  priority      VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
  due_date      DATE,
  status        VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Investigations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_investigations (
  id                  SERIAL PRIMARY KEY,
  incident_id         INT          UNIQUE NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  findings            TEXT,
  evidence            TEXT,
  investigated_by     INT          REFERENCES users(id),
  investigation_date  DATE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Root Causes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_root_causes (
  id                    SERIAL PRIMARY KEY,
  incident_id           INT          UNIQUE NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  root_cause_category   VARCHAR(100) NOT NULL,
  description           TEXT         NOT NULL,
  contributing_factors  TEXT,
  causal_chain          TEXT,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Controls ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_controls (
  id                  SERIAL PRIMARY KEY,
  incident_id         INT          NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  control_type        VARCHAR(50)  NOT NULL,
  description         TEXT         NOT NULL,
  owner               INT          REFERENCES users(id),
  implementation_date DATE,
  status              VARCHAR(30)  NOT NULL DEFAULT 'PLANNED',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Reviews ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_reviews (
  id                   SERIAL PRIMARY KEY,
  incident_id          INT          UNIQUE NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  reviewer_id          INT          REFERENCES users(id),
  review_notes         TEXT,
  effectiveness_rating INT          CHECK (effectiveness_rating BETWEEN 1 AND 5),
  review_date          DATE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Closures ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incident_closures (
  id               SERIAL PRIMARY KEY,
  incident_id      INT          UNIQUE NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  closure_summary  TEXT         NOT NULL,
  lessons_learned  TEXT,
  closed_by        INT          REFERENCES users(id),
  closure_date     DATE         NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── AI Embeddings (with pgvector) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id           SERIAL PRIMARY KEY,
  incident_id  INT          UNIQUE NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  embedding    vector(384),
  umap_x       FLOAT,
  umap_y       FLOAT,
  text_hash    VARCHAR(64),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Model Metrics ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_metrics (
  id                SERIAL PRIMARY KEY,
  model_type        VARCHAR(50)  NOT NULL,
  accuracy          FLOAT,
  precision_score   FLOAT,
  recall_score      FLOAT,
  f1_score          FLOAT,
  training_samples  INT,
  optimal_k         INT,
  silhouette_score  FLOAT,
  trained_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Audit Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           SERIAL PRIMARY KEY,
  user_id      INT          REFERENCES users(id),
  action       VARCHAR(50)  NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    INT,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_incidents_status     ON incidents(status)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_severity   ON incidents(severity)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_created    ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_cluster    ON incidents(cluster_id) WHERE cluster_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_embeddings_incident  ON ai_embeddings(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_user           ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created        ON audit_logs(created_at DESC);

-- ── Seed users (password = Admin@123) ─────────────────────────────────────
INSERT INTO users (name, email, password, role) VALUES
  ('System Admin', 'admin@ims.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Manager One',  'manager@ims.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
  ('Staff Member', 'staff@ims.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff')
ON CONFLICT (email) DO NOTHING;
