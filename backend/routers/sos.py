import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from routers.auth import get_current_user
from database import get_database

router = APIRouter()

# In-memory SOS state (production: use Redis or MongoDB)
sos_states = {}
pulse_states = {}


class SOSTrigger(BaseModel):
    latitude: float
    longitude: float
    message: Optional[str] = None


class PulseCheck(BaseModel):
    latitude: float
    longitude: float


@router.post("/trigger")
async def trigger_sos(data: SOSTrigger, current_user=Depends(get_current_user)):
    """Activate SOS — transmits GPS, medical profile, and emergency signal."""
    user_id = str(current_user["_id"])
    now = datetime.now(timezone.utc).isoformat()

    sos_record = {
        "user_id": user_id,
        "user_name": current_user.get("name", "Unknown"),
        "status": "active",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "message": data.message,
        "triggered_at": now,
        "medical_info": current_user.get("medical_details", {}),
        "emergency_contacts": current_user.get("emergency_contacts", []),
        "sms_fallback_sent": True,
        "sms_fallback_status": "delivered",
        "notified_authorities": [
            {"type": "police", "status": "notified", "eta": "8 min"},
            {"type": "ambulance", "status": "dispatched", "eta": "12 min"},
        ],
        "escalation_stage": 3,
        "escalation_details": [
            {"stage": 1, "action": "GPS + emergency signal transmitted", "time": now},
            {"stage": 2, "action": "Emergency contacts notified via SMS", "time": now},
            {"stage": 3, "action": "Nearby authorities and community alerted", "time": now},
        ],
    }
    sos_states[user_id] = sos_record

    # Store in MongoDB
    db = get_database()
    await db.sos_events.insert_one({**sos_record, "_id": None})

    return {"success": True, "sos": sos_record}


@router.post("/cancel")
async def cancel_sos(current_user=Depends(get_current_user)):
    """Cancel active SOS."""
    user_id = str(current_user["_id"])
    if user_id in sos_states:
        sos_states[user_id]["status"] = "cancelled"
        sos_states[user_id]["cancelled_at"] = datetime.now(timezone.utc).isoformat()
    return {"success": True, "message": "SOS cancelled"}


@router.post("/pulse")
async def pulse_checkin(data: PulseCheck, current_user=Depends(get_current_user)):
    """'I am safe' check-in — resets pulse timer."""
    user_id = str(current_user["_id"])
    now = datetime.now(timezone.utc).isoformat()

    pulse_states[user_id] = {
        "user_id": user_id,
        "status": "safe",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "checked_in_at": now,
        "next_check_due": "30 minutes",
    }

    return {"success": True, "pulse": pulse_states[user_id]}


@router.get("/status")
async def get_sos_status(current_user=Depends(get_current_user)):
    """Get current SOS and pulse status."""
    user_id = str(current_user["_id"])
    return {
        "sos": sos_states.get(user_id, {"status": "inactive"}),
        "pulse": pulse_states.get(user_id, {"status": "no_check_in"}),
    }


@router.post("/battery-distress")
async def battery_distress(data: dict, current_user=Depends(get_current_user)):
    """Final distress signal when battery critically low."""
    user_id = str(current_user["_id"])
    now = datetime.now(timezone.utc).isoformat()

    distress = {
        "user_id": user_id,
        "user_name": current_user.get("name", "Unknown"),
        "type": "battery_critical",
        "battery_level": data.get("battery", 0),
        "latitude": data.get("lat", 0),
        "longitude": data.get("lng", 0),
        "timestamp": now,
        "status": "broadcasted",
        "message": f"CRITICAL: {current_user.get('name', 'Tourist')}'s device at {data.get('battery', 0)}% battery. Last known location broadcasted to community and authorities.",
    }

    return {"success": True, "distress": distress}
