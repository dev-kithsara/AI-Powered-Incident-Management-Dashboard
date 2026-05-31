from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
import os

from db.database import AsyncSessionLocal
from services.embeddings import process_all_unprocessed
from services.clustering import refit_clustering
from services.classifier import train_classifier

logger    = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def run_ai_pipeline():
    """Periodic background job: embed new incidents, then refit models."""
    try:
        async with AsyncSessionLocal() as db:
            count = await process_all_unprocessed(db)
            if count > 0:
                logger.info(f"Processed {count} new incident(s). Refitting models...")
                await refit_clustering(db)
                await train_classifier(db)
            else:
                logger.debug("No new incidents to process.")
    except Exception as e:
        logger.error(f"AI pipeline error: {e}")


def setup_scheduler():
    interval = int(os.getenv("SCHEDULER_INTERVAL_MINUTES", "5"))
    scheduler.add_job(
        run_ai_pipeline,
        trigger=IntervalTrigger(minutes=interval),
        id="ai_pipeline",
        name="AI Processing Pipeline",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"✅ Scheduler started — pipeline runs every {interval} minutes")


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shut down")
