"""
Baseline training data seeder for the IMS AI service.

Inserts 30 realistic CLOSED incidents (8 CRITICAL, 8 HIGH, 8 MEDIUM, 6 LOW)
so the Gradient Boosting classifier has enough labelled data to train.

All inserted incidents are marked ai_processed = FALSE so the scheduler
picks them up immediately and generates real sentence-transformer embeddings,
after which train_classifier() can succeed.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 30 baseline incidents  (title, description, severity, category, department)
# ---------------------------------------------------------------------------
_BASELINE: list[tuple] = [
    # ── CRITICAL (8) ────────────────────────────────────────────────────────
    (
        "Complete Data Center Power Failure",
        "Total power loss across all data-center units. All production servers, "
        "storage arrays and network equipment are offline. UPS backup systems "
        "failed to engage. Over 200 business users impacted; estimated revenue "
        "loss of $50,000 per hour until restoration.",
        "CRITICAL", "Infrastructure", "IT Operations",
    ),
    (
        "Critical Database Crash with Data Corruption",
        "Primary production database server suffered a catastrophic failure "
        "causing corruption across multiple tables. Transaction logs indicate "
        "approximately 4 hours of data may be unrecoverable. All dependent "
        "applications are non-functional. Disaster recovery invoked.",
        "CRITICAL", "Database", "IT Operations",
    ),
    (
        "Ransomware Attack on Corporate Network",
        "Security team confirmed active ransomware infection spreading across "
        "the corporate network. File encryption detected on 47 endpoints. "
        "Network segmentation enacted. Incident response team engaged. Backup "
        "integrity being verified. Law enforcement notified.",
        "CRITICAL", "Security", "Cybersecurity",
    ),
    (
        "Production ERP System Complete Outage",
        "The enterprise ERP platform (SAP) is completely unavailable. All "
        "manufacturing orders, procurement workflows and financial postings are "
        "blocked. 350 concurrent users affected. Vendor P1 ticket raised. "
        "Manual workarounds activated for critical production lines.",
        "CRITICAL", "Application", "Manufacturing",
    ),
    (
        "Server Room Fire Suppression System Activation",
        "Inert gas fire suppression triggered in primary server room. "
        "Emergency shutdown of all equipment initiated per safety protocol. "
        "Physical damage assessment ongoing. All IT services unavailable. "
        "Business continuity plan activated; failover to DR site in progress.",
        "CRITICAL", "Facilities", "Facilities Management",
    ),
    (
        "Major Security Breach — Unauthorised Data Exfiltration",
        "Forensic analysis confirmed external attacker accessed customer PII "
        "database containing 120,000 records. Data exfiltration occurred over "
        "72 hours before detection. Regulatory notification obligations "
        "triggered. Customer communication plan being drafted.",
        "CRITICAL", "Security", "Cybersecurity",
    ),
    (
        "Complete Network Infrastructure Failure",
        "Core switching fabric failure caused total loss of network connectivity "
        "across all three office buildings and the manufacturing floor. VoIP, "
        "email, ERP and internet access are all offline. Vendor hardware "
        "replacement dispatched; ETA 4 hours.",
        "CRITICAL", "Network", "IT Operations",
    ),
    (
        "Production Line Chemical Spill — Emergency Evacuation",
        "Large chemical spill on production floor Line 3 triggered full building "
        "evacuation. Hazmat team called. All manufacturing operations suspended. "
        "Two employees required decontamination. Environmental agency notified. "
        "Production loss estimated at 800 units per hour.",
        "CRITICAL", "Safety", "Health & Safety",
    ),

    # ── HIGH (8) ────────────────────────────────────────────────────────────
    (
        "Major Power Outage Affecting Production Floor",
        "Power outage on the south wing of the production facility caused "
        "shutdown of two assembly lines and all supporting automation equipment. "
        "Generator backup is operational but cannot sustain full load. "
        "Approximately 80 production staff stood down.",
        "HIGH", "Infrastructure", "Facilities Management",
    ),
    (
        "Primary Database Server Failure — Read-Only Failover",
        "Primary PostgreSQL server experienced storage controller failure. "
        "Automatic failover to read-only replica completed in 8 minutes. "
        "All write operations are blocked. Application teams switching to "
        "maintenance mode. Hardware replacement expected within 6 hours.",
        "HIGH", "Database", "IT Operations",
    ),
    (
        "Email and Collaboration Platform Outage",
        "Microsoft 365 tenant experiencing complete service disruption affecting "
        "email, Teams and SharePoint. 420 employees unable to communicate. "
        "Microsoft support ticket escalated to Sev A. Workaround: company "
        "mobile numbers distributed for urgent communication.",
        "HIGH", "Application", "IT Operations",
    ),
    (
        "Critical Assembly Equipment Breakdown on Production Line 2",
        "Main robotic welding arm on Line 2 suffered servo motor failure. "
        "Production halted. Estimated repair time: 6 hours. Downstream "
        "packaging area also stopped. Daily output target at risk. "
        "Maintenance engineer and OEM support contacted.",
        "HIGH", "Equipment", "Manufacturing",
    ),
    (
        "HVAC System Failure in Primary Server Room",
        "Air conditioning unit in the main server room failed. Room temperature "
        "rising at 3°C per hour. Servers set to thermal-throttle at 35°C. "
        "Emergency portable cooling units being deployed. Risk of thermal "
        "shutdown within 2 hours if not resolved.",
        "HIGH", "Facilities", "Facilities Management",
    ),
    (
        "Daily Backup Job Failure — 72-Hour Data Gap",
        "Automated backup jobs for core databases have been silently failing for "
        "3 days. The last verified backup is 72 hours old. Root cause identified "
        "as disk quota exhaustion on the backup server. Additional storage "
        "provisioned; full backup initiated.",
        "HIGH", "Database", "IT Operations",
    ),
    (
        "Financial System Reporting Errors — Month-End Close Impacted",
        "The financial reporting module is producing incorrect GL figures due to "
        "a corrupt database index. Month-end close process for Finance is "
        "blocked. Approximately $2.3M in transactions may require manual "
        "reconciliation. Vendor patch being tested in staging.",
        "HIGH", "Application", "Finance",
    ),
    (
        "Customer Web Portal Unavailable — SSL Certificate Expired",
        "The customer self-service portal became unreachable after an SSL "
        "certificate expired undetected. Approximately 1,200 customers unable "
        "to access accounts. Certificate renewed and redeployed; full service "
        "restoration confirmed after 2-hour outage.",
        "HIGH", "Application", "Customer Services",
    ),

    # ── MEDIUM (8) ──────────────────────────────────────────────────────────
    (
        "Intermittent Network Connectivity Issues in Building B",
        "Users in Building B reporting intermittent network drops lasting "
        "10-30 seconds every hour. Productivity impacted for approximately "
        "40 users. Network team identified a flapping uplink port. "
        "Replacement switch module scheduled for out-of-hours installation.",
        "MEDIUM", "Network", "IT Operations",
    ),
    (
        "Application Performance Degradation — ERP Response Times",
        "ERP system response times have increased from an average of 1.2s to "
        "8-12s following Tuesday's software update. Approx 60 users affected. "
        "Database query plan cache cleared; performance partially improved. "
        "Vendor investigating root cause; fix expected in 48 hours.",
        "MEDIUM", "Application", "IT Operations",
    ),
    (
        "Warehouse Management System Intermittent Errors",
        "WMS showing intermittent timeout errors during pick-and-pack "
        "operations. Approximately 15% of scan operations fail on first attempt "
        "and succeed on retry. Warehouse throughput reduced by 20%. "
        "Application server logs show database connection pool exhaustion.",
        "MEDIUM", "Application", "Warehouse",
    ),
    (
        "VPN Service Instability for Remote Workers",
        "Remote access VPN is dropping sessions every 2-3 hours requiring "
        "manual reconnection. 35 remote employees affected. Concurrent session "
        "limit reached during peak hours identified as root cause. "
        "Licence upgrade approved; additional capacity deployed.",
        "MEDIUM", "Network", "IT Operations",
    ),
    (
        "Slow Database Query Performance — Reporting Module",
        "Monthly sales reports taking 45 minutes to generate instead of the "
        "usual 4 minutes. Finance team unable to meet reporting deadline. "
        "Missing index on sales_transactions table identified and added. "
        "Report generation time restored to 5 minutes.",
        "MEDIUM", "Database", "Finance",
    ),
    (
        "Partial Cooling System Failure in Lab Area",
        "One of two HVAC units in the quality lab is non-functional. "
        "Temperature in the lab has risen to 26°C; acceptable limit is 24°C. "
        "Sensitive calibration equipment may be affected. Portable unit "
        "deployed; engineer scheduled for morning repair.",
        "MEDIUM", "Facilities", "Quality Assurance",
    ),
    (
        "Software Licence Expiry — CAD Design Tools",
        "Engineering CAD software licences expired without renewal causing "
        "8 design engineers to lose access. New product development drawings "
        "for Sprint 14 delayed. Emergency licence extension approved and "
        "applied; access restored within 3 hours.",
        "MEDIUM", "Software", "Engineering",
    ),
    (
        "Security Camera System Partial Outage — Warehouse Zone C",
        "12 of 48 security cameras in Warehouse Zone C are offline following "
        "a network switch failure. Physical security coverage degraded. "
        "Security patrols increased in affected area. Switch replacement "
        "ordered and expected within 24 hours.",
        "MEDIUM", "Security", "Physical Security",
    ),

    # ── LOW (6) ─────────────────────────────────────────────────────────────
    (
        "Minor UI Display Bug on Employee Self-Service Portal",
        "Employee self-service portal showing incorrect date format (MM/DD/YYYY "
        "instead of DD/MM/YYYY) on holiday request confirmation screens. "
        "Cosmetic issue only; all underlying data is correct. "
        "Fix deployed in the next scheduled release window.",
        "LOW", "Application", "HR",
    ),
    (
        "Low Printer Toner Warning — Finance Department",
        "Network printer on the Finance floor is showing a low toner warning. "
        "Estimated 200 pages remaining. Replacement toner cartridge ordered "
        "from stores. No immediate operational impact; print jobs continue "
        "normally.",
        "LOW", "Hardware", "Finance",
    ),
    (
        "Scheduled Maintenance Notification — Weekend Patching Window",
        "Planned maintenance window scheduled for Saturday 22:00-02:00 for "
        "OS security patches on 12 non-critical servers. Users notified "
        "via email 5 days in advance. No business impact expected. "
        "Change Advisory Board approval obtained.",
        "LOW", "Infrastructure", "IT Operations",
    ),
    (
        "Minor Software Update Advisory — Antivirus Definitions",
        "Antivirus definition update on 8 workstations failed silently due "
        "to proxy timeout. Devices are 3 days behind the latest definitions. "
        "No active threat detected. Manual update pushed via endpoint "
        "management tool; all devices now current.",
        "LOW", "Security", "Cybersecurity",
    ),
    (
        "Meeting Room AV Equipment Lag Issue",
        "Projector in Meeting Room 4B experiencing 2-3 second input lag when "
        "switching between laptop sources. Meeting presenter experience "
        "degraded. HDMI cable replaced; issue resolved. Equipment "
        "added to quarterly inspection schedule.",
        "LOW", "Hardware", "Facilities Management",
    ),
    (
        "Informational — Disk Space Threshold Alert on Archive Server",
        "Archive file server reached 75% disk utilisation, triggering the "
        "advisory monitoring alert (threshold: 75%). Current growth rate "
        "projects capacity will be reached in 90 days. Capacity review "
        "scheduled with infrastructure team; no immediate action required.",
        "LOW", "Infrastructure", "IT Operations",
    ),
]


async def seed_baseline_incidents(db: AsyncSession) -> dict:
    """
    Insert baseline training incidents if they have not already been seeded.
    Uses the title as a uniqueness key to prevent duplicate inserts on repeated calls.

    Returns a summary dict with counts of inserted and skipped incidents.
    """
    # Check how many baseline titles already exist
    placeholders = ", ".join(f":t{i}" for i in range(len(_BASELINE)))
    titles        = {f"t{i}": row[0] for i, row in enumerate(_BASELINE)}

    existing_rows = (await db.execute(
        text(f"SELECT title FROM incidents WHERE title IN ({placeholders})"),
        titles,
    )).fetchall()
    existing_titles = {r[0] for r in existing_rows}

    # Get a valid reporter user_id (admin)
    uid_row = (await db.execute(text("SELECT id FROM users LIMIT 1"))).fetchone()
    reporter_id = uid_row[0] if uid_row else None

    inserted = 0
    skipped  = 0

    for title, description, severity, category, department in _BASELINE:
        if title in existing_titles:
            skipped += 1
            continue

        await db.execute(text("""
            INSERT INTO incidents
              (title, description, severity, category, department,
               reported_by, status, ai_processed, created_at, updated_at)
            VALUES
              (:title, :desc, :sev, :cat, :dept,
               :uid, 'CLOSED', FALSE, NOW() - (RANDOM() * INTERVAL '90 days'), NOW())
        """), {
            "title": title,
            "desc":  description,
            "sev":   severity,
            "cat":   category,
            "dept":  department,
            "uid":   reporter_id,
        })
        inserted += 1

    await db.commit()
    logger.info("Seeder: inserted=%d  skipped=%d (already existed)", inserted, skipped)
    return {
        "inserted": inserted,
        "skipped":  skipped,
        "total_baseline": len(_BASELINE),
        "message": (
            f"Inserted {inserted} baseline incidents. "
            f"Pipeline will now embed and train the classifier automatically."
            if inserted > 0
            else "All baseline incidents already present — no duplicates inserted."
        ),
    }
