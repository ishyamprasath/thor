import json
import math
import os
import random
from fastapi import APIRouter, Query, Depends
from typing import Optional
from database import get_tracked_tourists_collection
from routers.auth import get_current_user

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


def haversine(lat1, lon1, lat2, lon2):
    """Distance in meters between two GPS points."""
    R = 6371000
    p = math.pi / 180
    a = 0.5 - math.cos((lat2 - lat1) * p) / 2 + \
        math.cos(lat1 * p) * math.cos(lat2 * p) * (1 - math.cos((lon2 - lon1) * p)) / 2
    return 2 * R * math.asin(math.sqrt(a))


def generate_mock_points(lat, lng, count=5, is_hazard=False):
    points = []
    haz_types = ["protest", "flash_flood", "scam_zone", "wildlife_warning", "road_closure"]
    safe_types = ["police_station", "hospital", "embassy", "verified_shelter"]
    
    for i in range(count):
        d_lat = (random.random() - 0.5) * 0.05
        d_lng = (random.random() - 0.5) * 0.05
        if is_hazard:
            points.append({
                "incident_id": f"hz_dynamic_{i}",
                "type": random.choice(haz_types),
                "severity_score": random.randint(40, 95),
                "latitude": lat + d_lat,
                "longitude": lng + d_lng,
                "danger_radius_meters": random.randint(200, 1500),
                "status": "active",
                "description": f"Dynamic Alert near {lat:.2f}, {lng:.2f}",
                "city": "Unknown"
            })
        else:
            points.append({
                "category": random.choice(safe_types),
                "latitude": lat + d_lat,
                "longitude": lng + d_lng,
                "name": f"Verified Response Center {i}",
                "operating_hours": "24/7",
                "contact_number": "+1234567890",
                "city": "Unknown"
            })
    return points


@router.get("/zones")
async def get_safe_zones(
    category: Optional[str] = None,
    city: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 50000,
):
    """List safe zones, optionally filtered by category, city, or proximity."""
    zones = load_json("safe_zones.json")
    if category:
        zones = [z for z in zones if z["category"] == category]
    if city:
        zones = [z for z in zones if z.get("city", "").lower() == city.lower()]
    if lat is not None and lng is not None:
        zones = [
            {**z, "distance_m": round(haversine(lat, lng, z["latitude"], z["longitude"]))}
            for z in zones
        ]
        zones = [z for z in zones if z["distance_m"] <= radius]
        
        # If no zones are within this radius (meaning user is far from prototype cities), auto-generate some!
        if len(zones) == 0:
            mock_zones = generate_mock_points(lat, lng, count=random.randint(4, 8), is_hazard=False)
            for z in mock_zones:
                z["distance_m"] = round(haversine(lat, lng, z["latitude"], z["longitude"]))
            zones = mock_zones

        zones.sort(key=lambda x: x["distance_m"])
        
    return {"zones": zones, "count": len(zones)}


@router.get("/hazards")
async def get_hazards(
    status: Optional[str] = "active",
    city: Optional[str] = None,
    min_severity: Optional[int] = 0,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 50000,
):
    """List hazard incidents."""
    hazards = load_json("hazards.json")
    if status:
        hazards = [h for h in hazards if h["status"] == status]
    if city:
        hazards = [h for h in hazards if h.get("city", "").lower() == city.lower()]
    hazards = [h for h in hazards if h["severity_score"] >= min_severity]
    
    if lat is not None and lng is not None:
        hazards = [
            {**h, "distance_m": round(haversine(lat, lng, h["latitude"], h["longitude"]))}
            for h in hazards
        ]
        hazards = [h for h in hazards if h["distance_m"] <= radius]
        
        # If no hazards exist near the user, dynamically generate them!
        if len(hazards) == 0:
            mock_hazards = generate_mock_points(lat, lng, count=random.randint(5, 12), is_hazard=True)
            for h in mock_hazards:
                h["distance_m"] = round(haversine(lat, lng, h["latitude"], h["longitude"]))
            hazards = mock_hazards
            
    hazards.sort(key=lambda x: x.get("distance_m", x["severity_score"]))
    return {"hazards": hazards, "count": len(hazards)}


@router.get("/score")
async def get_safety_score(
    lat: float = Query(...),
    lng: float = Query(...),
):
    """Calculate safety score 0-100 based on nearby hazards and safe zones."""
    hazards = load_json("hazards.json")
    zones = load_json("safe_zones.json")

    # Penalty from nearby active hazards
    penalty = 0
    nearby_hazards = []
    for h in hazards:
        if h["status"] != "active":
            continue
        dist = haversine(lat, lng, h["latitude"], h["longitude"])
        if dist <= h["danger_radius_meters"] * 2:
            impact = h["severity_score"] * max(0, 1 - dist / (h["danger_radius_meters"] * 2))
            penalty += impact
            nearby_hazards.append({**h, "distance_m": round(dist)})

    # Bonus from nearby safe zones
    safe_bonus = 0
    nearby_safe = []
    for z in zones:
        dist = haversine(lat, lng, z["latitude"], z["longitude"])
        if dist <= 3000:
            safe_bonus += 5
            nearby_safe.append({**z, "distance_m": round(dist)})

    score = max(0, min(100, 85 - penalty / 3 + min(safe_bonus, 15)))
    level = "safe" if score >= 70 else "caution" if score >= 40 else "danger"

    return {
        "score": round(score),
        "level": level,
        "nearby_hazards": nearby_hazards[:5],
        "nearby_safe_zones": sorted(nearby_safe, key=lambda x: x["distance_m"])[:5],
    }


@router.post("/geofence-check")
async def geofence_check(data: dict):
    """Check if coordinates fall inside any hazard danger zone."""
    lat = data.get("lat", 0)
    lng = data.get("lng", 0)
    hazards = load_json("hazards.json")
    alerts = []

    for h in hazards:
        if h["status"] != "active":
            continue
        dist = haversine(lat, lng, h["latitude"], h["longitude"])
        if dist <= h["danger_radius_meters"]:
            alerts.append({
                "incident_id": h["incident_id"],
                "type": h["type"],
                "severity_score": h["severity_score"],
                "description": h["description"],
                "distance_m": round(dist),
                "danger_radius_meters": h["danger_radius_meters"],
                "within_zone": True,
            })

    return {
        "in_danger": len(alerts) > 0,
        "alerts": alerts,
        "checked_at": {"lat": lat, "lng": lng},
    }

@router.get("/my-alert")
async def check_simulated_alerts(current_user=Depends(get_current_user)):
    """Tourist device constantly polls this to see if Enterprise triggered an alert."""
    email = current_user.get("email")
    if not email:
        return {"alert": False}
        
    col = get_tracked_tourists_collection()
    tourist = await col.find_one({"email": email, "simulated_alert": True})
    
    if tourist:
        # Immediately acknowledge and clear the flag so it only triggers once per simulation
        await col.update_many(
            {"email": email},
            {"$set": {"simulated_alert": False}}
        )
        return {"alert": True}
        
    return {"alert": False}


@router.get("/nearest")
async def find_nearest(
    lat: float = Query(...),
    lng: float = Query(...),
    type: Optional[str] = None,
    limit: int = 5,
):
    """Find nearest safe zones by type."""
    zones = load_json("safe_zones.json")
    if type:
        zones = [z for z in zones if z["category"] == type]
    for z in zones:
        z["distance_m"] = round(haversine(lat, lng, z["latitude"], z["longitude"]))
    zones.sort(key=lambda x: x["distance_m"])
    return {"nearest": zones[:limit]}


# ── Google Places Nearby Search (REAL DATA) ──────────────────────────

import httpx
from dotenv import load_dotenv

load_dotenv()
GOOGLE_MAPS_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

PLACE_CATEGORIES = {
    "hospital": {"type": "hospital", "icon": "🏥", "color": "#ef4444"},
    "pharmacy": {"type": "pharmacy", "icon": "💊", "color": "#8b5cf6"},
    "police": {"type": "police", "icon": "🚔", "color": "#3b82f6"},
    "grocery_or_supermarket": {"type": "grocery_or_supermarket", "icon": "🛒", "color": "#22c55e"},
    "atm": {"type": "atm", "icon": "💳", "color": "#eab308"},
    "gas_station": {"type": "gas_station", "icon": "⛽", "color": "#f97316"},
    "fire_station": {"type": "fire_station", "icon": "🚒", "color": "#ef4444"},
    "restaurant": {"type": "restaurant", "icon": "🍽️", "color": "#ec4899"},
}


@router.get("/nearby-places")
async def get_nearby_places(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: int = Query(default=3000, le=50000),
    category: Optional[str] = None,
):
    """Fetch REAL nearby places from Google Maps Places API."""
    if not GOOGLE_MAPS_KEY:
        return {"places": [], "error": "Google Maps API key not configured"}

    categories = [category] if category and category in PLACE_CATEGORIES else list(PLACE_CATEGORIES.keys())
    
    all_places = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for cat in categories:
            place_type = PLACE_CATEGORIES[cat]["type"]
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "type": place_type,
                "key": GOOGLE_MAPS_KEY,
            }
            try:
                resp = await client.get(url, params=params)
                data = resp.json()
                results = data.get("results", [])
                
                for r in results[:5]:  # Max 5 per category
                    geo = r.get("geometry", {}).get("location", {})
                    all_places.append({
                        "place_id": r.get("place_id"),
                        "name": r.get("name", "Unknown"),
                        "category": cat,
                        "icon": PLACE_CATEGORIES[cat]["icon"],
                        "color": PLACE_CATEGORIES[cat]["color"],
                        "latitude": geo.get("lat"),
                        "longitude": geo.get("lng"),
                        "address": r.get("vicinity", ""),
                        "rating": r.get("rating"),
                        "open_now": r.get("opening_hours", {}).get("open_now"),
                        "distance_m": round(haversine(lat, lng, geo.get("lat", 0), geo.get("lng", 0))),
                    })
            except Exception as e:
                print(f"Places API error for {cat}: {e}")
                continue
    
    all_places.sort(key=lambda x: x["distance_m"])
    return {"places": all_places, "count": len(all_places)}
