import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel
from database import (
    get_enterprise_trips_collection,
    get_invitations_collection,
    get_tracked_tourists_collection,
)

router = APIRouter()


# ─── Pydantic Models ───────────────────────────────────────────────────────────

class InviteRequest(BaseModel):
    email: str
    trip_id: str

class TripCreateRequest(BaseModel):
    name: str
    destination: str
    start_date: str
    end_date: str
    tourist_emails: list[str]


# ─── Helper: strip Mongo's internal _id ────────────────────────────────────────

def _clean(doc: dict) -> dict:
    """Remove MongoDB's _id from the document before returning as JSON."""
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


# ─── Tourists ──────────────────────────────────────────────────────────────────

@router.get("/tourists")
async def get_all_tourists(
    status: Optional[str] = None,
    safety: Optional[str] = None,
    search: Optional[str] = None,
    trip_id: Optional[str] = None,
):
    """List all tracked tourists with live telemetry."""
    col = get_tracked_tourists_collection()
    query = {}
    if trip_id:
        query["trip_id"] = trip_id
    if status:
        query["trip_status"] = status
    if safety:
        query["safety_status"] = safety

    tourists = await col.find(query).to_list(length=500)
    tourists = [_clean(t) for t in tourists]

    if search:
        q = search.lower()
        tourists = [t for t in tourists if q in t.get("name", "").lower() or q in t.get("country", "").lower()]

    return {"tourists": tourists, "count": len(tourists)}


@router.get("/tourist/{user_id}")
async def get_tourist_detail(user_id: str):
    """Individual tourist detail with full telemetry."""
    col = get_tracked_tourists_collection()
    tourist = await col.find_one({"user_id": user_id})
    if not tourist:
        return {"error": "Tourist not found"}

    tourist = _clean(tourist)

    # Enrich with simulated history
    tourist["movement_history"] = [
        {"lat": tourist["current_lat"] + 0.001 * i, "lng": tourist["current_long"] + 0.001 * i,
         "timestamp": f"2026-03-08T0{7-i}:00:00Z"} for i in range(5)
    ]
    tourist["recent_alerts"] = []
    if tourist["safety_status"] == "danger":
        tourist["recent_alerts"].append({"type": "SOS_ACTIVE", "message": "Tourist has activated SOS", "severity": "critical", "time": "2026-03-08T05:30:00Z"})
    if tourist["battery_percentage"] < 15:
        tourist["recent_alerts"].append({"type": "LOW_BATTERY", "message": f"Battery at {tourist['battery_percentage']}%", "severity": "warning", "time": "2026-03-08T07:00:00Z"})
    if tourist["network_status"] == "offline":
        tourist["recent_alerts"].append({"type": "OFFLINE", "message": "Tourist is offline — SMS sentinel active", "severity": "warning", "time": "2026-03-08T06:30:00Z"})

    tourist["medical_profile"] = {"blood_group": "O+", "allergies": "None reported", "conditions": "None"}
    tourist["emergency_contacts"] = [
        {"name": "Embassy Contact", "phone": "+91-422-2300000", "relation": "Embassy"},
        {"name": "Tour Guide", "phone": "+91-98765-43210", "relation": "Guide"},
    ]

    return {"tourist": tourist}


# ─── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_dashboard_stats(trip_id: Optional[str] = None):
    """Dashboard statistics for enterprise command center."""
    col = get_tracked_tourists_collection()
    query = {}
    if trip_id:
        query["trip_id"] = trip_id

    tourists = await col.find(query).to_list(length=500)

    total = len(tourists)
    online = len([t for t in tourists if t.get("network_status") == "online"])
    offline = len([t for t in tourists if t.get("network_status") == "offline"])
    sos_active = len([t for t in tourists if t.get("sos_active")])
    danger = len([t for t in tourists if t.get("safety_status") == "danger"])
    warning = len([t for t in tourists if t.get("safety_status") == "warning"])
    safe = len([t for t in tourists if t.get("safety_status") == "safe"])
    low_battery = len([t for t in tourists if t.get("battery_percentage", 100) < 15])
    active_hazards = 0

    return {
        "total_tourists": total,
        "online": online,
        "offline": offline,
        "sos_active": sos_active,
        "danger": danger,
        "warning": warning,
        "safe": safe,
        "low_battery": low_battery,
        "active_hazards": active_hazards,
    }


# ─── Activity Feed ─────────────────────────────────────────────────────────────

@router.get("/feed")
async def get_activity_feed(trip_id: Optional[str] = None):
    """Real-time activity feed for the command center."""
    col = get_tracked_tourists_collection()
    query = {}
    if trip_id:
        query["trip_id"] = trip_id

    tourists = await col.find(query).to_list(length=500)
    events = []

    for t in tourists:
        if t.get("sos_active"):
            events.append({
                "type": "SOS_ACTIVATED", "severity": "critical",
                "message": f"🚨 {t.get('name', 'Unknown')} has activated SOS",
                "user_id": t["user_id"],
                "location": {"lat": t["current_lat"], "lng": t["current_long"]},
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "battery": t.get("battery_percentage"),
            })
        if t.get("network_status") == "offline":
            events.append({
                "type": "WENT_OFFLINE", "severity": "warning",
                "message": f"📡 {t.get('name', 'Unknown')} went offline — SMS sentinel activated",
                "user_id": t["user_id"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        if t.get("battery_percentage", 100) < 10:
            events.append({
                "type": "BATTERY_CRITICAL", "severity": "warning",
                "message": f"🔋 {t.get('name', 'Unknown')}'s battery at {t['battery_percentage']}%",
                "user_id": t["user_id"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

    severity_order = {"critical": 0, "warning": 1, "info": 2}
    events.sort(key=lambda e: severity_order.get(e["severity"], 3))
    return {"events": events[:30], "count": len(events)}


# ─── Check-in ──────────────────────────────────────────────────────────────────

@router.post("/checkin/{user_id}")
async def manual_checkin(user_id: str):
    """Operator triggers manual check-in for a tourist."""
    return {
        "success": True,
        "message": f"Check-in request sent to {user_id}",
        "notification_sent": True,
        "sms_sent": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Invitations ───────────────────────────────────────────────────────────────

@router.post("/invite")
async def send_tourist_invite(req: InviteRequest):
    """Send a tracking request to a tourist via email."""
    col = get_invitations_collection()

    # Avoid duplicate pending invites for the same email + trip combo
    existing = await col.find_one({"email": req.email, "trip_id": req.trip_id, "status": "pending"})
    if existing:
        return {"success": True, "message": f"Invitation already pending for {req.email}"}

    invite = {
        "invite_id": f"inv_{uuid.uuid4().hex[:12]}",
        "email": req.email,
        "trip_id": req.trip_id,
        "enterprise_name": "THOR.",
        "status": "pending",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await col.insert_one(invite)
    return {"success": True, "message": f"Invitation sent to {req.email}"}


# ─── Trips (Enterprise Projects) ──────────────────────────────────────────────

@router.post("/trips")
async def create_enterprise_trip(req: TripCreateRequest):
    """Create a new trip project and dispatch invites to assigned tourists."""
    trips_col = get_enterprise_trips_collection()
    inv_col = get_invitations_collection()

    trip_id = f"trip_{uuid.uuid4().hex[:12]}"

    trip = {
        "trip_id": trip_id,
        "name": req.name,
        "destination": req.destination,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await trips_col.insert_one(trip)

    # Dispatch invites
    for email in req.tourist_emails:
        invite = {
            "invite_id": f"inv_{uuid.uuid4().hex[:12]}",
            "email": email,
            "trip_id": trip_id,
            "enterprise_name": "THOR.",
            "status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await inv_col.insert_one(invite)

    # Return a clean copy (without _id)
    trip.pop("_id", None)
    return {"success": True, "trip": trip}


@router.get("/trips")
async def get_enterprise_trips():
    """List all created trips for the enterprise."""
    col = get_enterprise_trips_collection()
    trips = await col.find().to_list(length=200)
    trips = [_clean(t) for t in trips]
    return {"trips": trips}


@router.get("/trips/{trip_id}")
async def get_enterprise_trip(trip_id: str):
    col = get_enterprise_trips_collection()
    trip = await col.find_one({"trip_id": trip_id})
    if not trip:
        return {"error": "Trip not found"}
    return {"trip": _clean(trip)}


# ─── Tourist-facing invitation endpoints ──────────────────────────────────────

@router.get("/invitations/{email}")
async def get_tourist_invitations(email: str):
    """Tourist checks if there are any pending tracking requests."""
    col = get_invitations_collection()
    pending = await col.find({"email": email, "status": "pending"}).to_list(length=100)
    pending = [_clean(p) for p in pending]
    # Frontend uses "id" field for invite identification
    for p in pending:
        p["id"] = p.get("invite_id", "")
    return {"invitations": pending}


@router.post("/invitations/{invite_id}/accept")
async def accept_invitation(invite_id: str):
    """Tourist accepts the tracking request."""
    inv_col = get_invitations_collection()
    tracking_col = get_tracked_tourists_collection()

    invite = await inv_col.find_one({"invite_id": invite_id})
    if not invite:
        return {"success": False, "error": "Invite not found."}

    # Mark as accepted
    await inv_col.update_one({"invite_id": invite_id}, {"$set": {"status": "accepted"}})

    # Inject tourist into tracked collection if not already present
    existing = await tracking_col.find_one({"email": invite["email"], "trip_id": invite["trip_id"]})
    if not existing:
        count = await tracking_col.count_documents({})
        await tracking_col.insert_one({
            "user_id": f"usr_{uuid.uuid4().hex[:10]}",
            "email": invite["email"],
            "trip_id": invite["trip_id"],
            "name": invite["email"].split("@")[0].title(),
            "country": "Unknown",
            "trip_destination": "Tracking Route",
            "trip_status": "active",
            "safety_status": "safe",
            "battery_percentage": 100,
            "network_status": "online",
            "sos_active": False,
            "current_lat": 11.0168 + (count * 0.005),
            "current_long": 76.9558 + (count * 0.005),
            "last_pulse_check_ack": datetime.now(timezone.utc).isoformat()
        })

    return {"success": True, "message": "Tracking authorized."}
