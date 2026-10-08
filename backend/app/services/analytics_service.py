from app.database.connection import get_database
from datetime import datetime, timedelta

async def get_analytics_data():
    db = get_database()
    
    # Simple historical trend: counts for last 7 days
    trends = []
    today = datetime.utcnow()
    for i in range(7):
        target_date = today - timedelta(days=i)
        start_of_day = datetime(target_date.year, target_date.month, target_date.day)
        end_of_day = start_of_day + timedelta(days=1)
        
        count = await db.complaints.count_documents({
            "created_at": {"$gte": start_of_day, "$lt": end_of_day}
        })
        trends.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    # Reverse to make it chronological
    trends.reverse()

    return {
        "trends": trends
    }

import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

async def get_hotspots():
    db = get_database()
    recent = datetime.utcnow() - timedelta(days=14)
    
    cursor = db.complaints.find({
        "created_at": {"$gte": recent},
        "status": {"$in": ["pending", "in_progress"]}
    })
    complaints = await cursor.to_list(length=2000)
    
    clusters = []
    
    for c in complaints:
        loc = c.get("location")
        if not loc: continue
        
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        ai = c.get("ai_analysis") or {}
        dept = ai.get("predicted_department", "General")
        
        if lat is None or lon is None: continue
        
        found_cluster = False
        for cluster in clusters:
            if cluster["department"] == dept:
                dist = haversine(lat, lon, cluster["center_lat"], cluster["center_lon"])
                if dist < 2.0: # within 2km radius
                    cluster["count"] += 1
                    cluster["complaint_ids"].append(str(c["_id"]))
                    # Update center (simple average)
                    cluster["center_lat"] = (cluster["center_lat"] * (cluster["count"] - 1) + lat) / cluster["count"]
                    cluster["center_lon"] = (cluster["center_lon"] * (cluster["count"] - 1) + lon) / cluster["count"]
                    found_cluster = True
                    break
        
        if not found_cluster:
            clusters.append({
                "id": str(c["_id"]) + "_cluster",
                "department": dept,
                "count": 1,
                "center_lat": lat,
                "center_lon": lon,
                "complaint_ids": [str(c["_id"])]
            })
            
    # Assign severity
    for c in clusters:
        if c["count"] >= 3:
            c["severity"] = "critical"
        elif c["count"] == 2:
            c["severity"] = "high"
        else:
            c["severity"] = "normal"
            
    hotspots = [c for c in clusters if c["count"] > 1]
    hotspots.sort(key=lambda x: x["count"], reverse=True)
    return {"hotspots": hotspots, "all_clusters": clusters}
