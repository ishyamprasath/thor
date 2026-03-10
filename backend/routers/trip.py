import os
import json
import urllib.parse
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai
import httpx

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-3.1-flash-lite-preview"

router = APIRouter()

def clean_json(text: str) -> str:
    """Strip markdown code fences from AI response."""
    t = text.strip()
    if t.startswith("```"):
        parts = t.split("```")
        t = parts[1] if len(parts) > 1 else t
        if t.startswith("json"):
            t = t[4:]
    if t.endswith("```"):
        t = t[:-3]
    return t.strip()

class TripRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    traveler_name: Optional[str] = "Traveler"

@router.post("/generate")
async def generate_trip_plan(req: TripRequest):
    """
    Generates a highly structured JSON mapping of hotels, meals, and route stops for the user's trip.
    """
    prompt = f"""You are an elite travel concierge. The traveler, {req.traveler_name}, is going to {req.destination} from {req.start_date} to {req.end_date}.
    
    You must design a detailed, realistic travel itinerary. You must pick SPECIFIC REAL PLACES (not generic names) in {req.destination}.
    Return ONLY valid JSON. The JSON must EXACTLY match this structure:
    {{
      "destination": "{req.destination}",
      "start_date": "{req.start_date}",
      "end_date": "{req.end_date}",
      "hotel_recommendation": {{
        "name": "Exact Name of a Highly Rated Hotel in {req.destination}",
        "latitude": 0.0,
        "longitude": 0.0
      }},
      "days": [
        {{
          "day": 1,
          "breakfast": {{ "name": "Real Cafe Name", "lat": 0.0, "lng": 0.0 }},
          "lunch": {{ "name": "Real Lunch Spot", "lat": 0.0, "lng": 0.0 }},
          "dinner": {{ "name": "Real Dinner Restaurant", "lat": 0.0, "lng": 0.0 }},
          "route_spots": [
            {{ "name": "Real Tourist Attraction 1", "lat": 0.0, "lng": 0.0, "description": "Short exciting detail" }},
            {{ "name": "Real Tourist Attraction 2", "lat": 0.0, "lng": 0.0, "description": "Short exciting detail" }}
          ]
        }}
      ]
    }}
    
    Ensure you generate the correct number of days between {req.start_date} and {req.end_date}.
    For demo purposes, please ensure coordinates are roughly accurate for {req.destination}.
    Provide NO OTHER TEXT EXCEPT THE JSON.
    """

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        json_str = clean_json(response.text)
        data = json.loads(json_str)
        return {"status": "success", "plan": data}
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate trip plan via AI.")

@router.get("/guides")
async def get_local_guides(destination: str):
    """
    Dynamically fetches REAL local guides / tourism offices using Google Places API TextSearch and Details.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return {"status": "success", "guides": []}

    encoded_dest = urllib.parse.quote(f"tour guides and tourism offices in {destination}")
    search_url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={encoded_dest}&key={api_key}"
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(search_url)
            data = resp.json()
            results = data.get("results", [])[:3]
            
            guides = []
            for r in results:
                place_id = r.get("place_id")
                # Fetch deeper details for real contact info
                details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=formatted_phone_number,website&key={api_key}"
                d_resp = await client.get(details_url)
                d_data = d_resp.json().get("result", {})
                
                guides.append({
                    "id": place_id,
                    "name": r.get("name", "Local Guide"),
                    "role": r.get("formatted_address", "Local Agency"),
                    "languages": ["English", "Local"],
                    "rating": r.get("rating", 4.0),
                    "price": "Check Website",
                    "phone": d_data.get("formatted_phone_number", ""),
                    "website": d_data.get("website", "")
                })
                
            return {"status": "success", "guides": guides}
    except Exception as e:
        print(f"Guides API Error: {str(e)}")
        # Fallback raw data if Places API struggles
        return {"status": "success", "guides": []}

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    language: str = "English"
    context: str = "concierge" # 'concierge' or 'global'
    active_plan: Optional[dict] = None

@router.post("/chat")
async def chat_with_ai(req: ChatRequest):
    """
    Stateful chat endpoint for the Concierge and Global Chatbot.
    Returns structured JSON with 'reply' and optional 'command'.
    """
    commands_desc = """
    You can also execute app commands by returning a JSON object.
    Available commands:
    - {"type": "navigate", "path": "/dashboard"} : Go to home/dashboard
    - {"type": "navigate", "path": "/map"} : Open safety map
    - {"type": "navigate", "path": "/emergency"} : Open emergency SOS page
    - {"type": "navigate", "path": "/community"} : Open community forum
    - {"type": "navigate", "path": "/settings"} : Open app settings
    - {"type": "auto_plan", "destination": "Paris", "days": 3} : FULLY AUTOMATE A TRIP — use this whenever the user says they want to go somewhere, visit a place, travel to a city, or plan a trip. Extract the exact destination name and a reasonable number of days (default 3 if not specified). This will automatically generate the entire itinerary with hotels, restaurants, and attractions.
    
    If the user sounds in danger or asks for help, immediately use the emergency navigate command.
    IMPORTANT: When any travel intent is detected (Paris, London, beach, mountains, etc.) ALWAYS use auto_plan, not navigate.
    
    To use a command, your response MUST be a JSON object like this:
    {
      "reply": "I'll take you to the trip planner now.",
      "command": {"type": "navigate", "path": "/planner"}
    }
    If no command is needed, just return:
    {
      "reply": "Your message here",
      "command": null
    }
    """

    if req.context == "concierge":
        plan_str = json.dumps(req.active_plan) if req.active_plan else "No active plan."
        sys_prompt = f"You are THOR AI, an elite cultural concierge. Current Plan: {plan_str}. {commands_desc}. Reply in {req.language}. Keep it concise."
    elif req.context == "voice":
        sys_prompt = f"You are THOR AI, a live vocal traveling companion. {commands_desc}. You are speaking aloud to the user right now via voice audio. Reply in {req.language}. Speak conversationally, warmly, and naturally. DO NOT use markdown, emojis, asterisks, or text formatting. Keep your responses brief and natural, like a real human conversation."
    elif req.context == "enterprise":
        sys_prompt = f"You are THOR Enterprise Command AI. {commands_desc}. Reply in {req.language}. Keep your tone formal, analytical, and authoritative. Do not use emojis or markdown."
    else:
        sys_prompt = f"You are THOR AI, the overarching system intelligence for the THOR app. {commands_desc}. Reply in {req.language}. Help users navigate or manage their profile."

    # Convert history
    formatted_history = []
    for h in req.history:
        role = "user" if h["role"] == "user" else "model"
        formatted_history.append({"role": role, "parts": [h["content"]]})

    try:
        model = genai.GenerativeModel(MODEL, system_instruction=sys_prompt)
        chat = model.start_chat(history=formatted_history)
        response = chat.send_message(req.message)
        
        # Try to parse as JSON if it looks like it, otherwise wrap it
        text = response.text.strip()
        try:
            if text.startswith("{") and text.endswith("}"):
                data = json.loads(clean_json(text))
                return data
            else:
                return {"reply": text, "command": None}
        except:
            return {"reply": text, "command": None}
            
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return {"reply": "I am experiencing network interference. Please try again.", "command": None}
