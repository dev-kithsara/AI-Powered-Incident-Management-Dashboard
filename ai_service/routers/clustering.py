from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db
from services.clustering import get_cluster_map, refit_clustering

router = APIRouter()


@router.get("/cluster-map")
async def cluster_map_endpoint(db: AsyncSession = Depends(get_db)):
    return await get_cluster_map(db)


@router.post("/retrain-clustering")
async def retrain_clustering(db: AsyncSession = Depends(get_db)):
    labels = await refit_clustering(db)
    return {"message": "Clustering model retrained", "cluster_labels": labels}


@router.get("/cluster-stats")
async def cluster_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT cluster_id,
               COUNT(*) AS total,
               COUNT(*) FILTER (WHERE severity = 'CRITICAL') AS critical,
               COUNT(*) FILTER (WHERE severity = 'HIGH')     AS high,
               COUNT(*) FILTER (WHERE severity = 'MEDIUM')   AS medium,
               COUNT(*) FILTER (WHERE severity = 'LOW')      AS low
        FROM   incidents
        WHERE  cluster_id IS NOT NULL AND deleted_at IS NULL
        GROUP  BY cluster_id
        ORDER  BY cluster_id
    """))
    rows = result.fetchall()
    return {
        "stats": [
            {
                "cluster_id":  r[0],
                "count":       r[1],
                "by_severity": {"CRITICAL": r[2], "HIGH": r[3], "MEDIUM": r[4], "LOW": r[5]},
            }
            for r in rows
        ]
    }
