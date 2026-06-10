# AI-Powered Incident Management System (IMS)

An enterprise-grade, high-performance incident tracking and mitigation platform powered by AI-driven analytics, Natural Language Processing (NLP), and vector embeddings.

## Key Features

1. **AI-Driven Analytics**: Machine Learning classifiers for automatic incident severity and category assessment.
2. **Lessons Learned Library**: Aggregated repository of closed incidents highlighting root causes, actions taken, and key takeaways.
3. **Live AI Recommendations**: Real-time suggestion engine offering historical resolutions and recommendations using vector similarity embeddings as you draft new incidents.
4. **Predictive Risk Scoring**: Proactive cluster and category forecasting to prevent upcoming incidents.

---

## Local Development & Setup (Windows with WSL 2)

We have migrated from a Vagrant-based VM setup to running the project directly on Windows using **Docker Desktop with WSL 2 integration**. This setup is faster, more performant, and runs cleanly using Linux containers on Windows.

### Prerequisites

1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/).
2. Enable the **WSL 2 backend** in Docker Desktop settings.
3. Ensure WSL integration is enabled for your default distro (e.g., Ubuntu) under `Settings > Resources > WSL integration`.

### Getting Started

1. Clone this repository to your local machine.
2. Open your terminal in the project root directory.
3. Start all services in detached mode:
   ```bash
   docker compose up -d
   ```
4. Verify the container status:
   ```bash
   docker compose ps
   ```

### Stopping Services

To stop and remove the active containers:
```bash
docker compose down
```

To stop containers while retaining their data volumes:
```bash
docker compose stop
```

---

## Database Management & Backups

A backup utility script is provided at the project root for capturing PostgreSQL snapshots.

### Backup Database
To back up the database:
```bash
bash ims_backup.sh
```
The snapshot will be saved to the `./backups/` directory.

### Restore Database
To restore the database from a backup file:
```bash
cat backups/ims_backup_YYYYMMDD_HHMMSS.sql | docker exec -i ims_postgres psql -U ims_user -d incident_management
```

---

## Service Endpoints

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Core Backend Service**: [http://localhost:8000](http://localhost:8000)
- **AI Analytics Service**: [http://localhost:8001](http://localhost:8001)
