from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import base64

router = APIRouter()

# Initialize Gemini safely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-3.1-flash-lite-preview"

class CulturalAnalysisResponse(BaseModel):
    place_type: str
    description: str
    respectful_tips: list[str]
    cultural_significance: str

@router.post("/analyze", response_model=CulturalAnalysisResponse)
async def analyze_cultural_place(image: UploadFile = File(...)):
    """
    Analyze an image of a cultural/religious place and return:
    - Place type (temple, mosque, church, etc.)
    - Description
    - Respectful usage tips
    - Cultural significance
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    # Validate image type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid image type. Allowed: {', '.join(allowed_types)}")

    try:
        # Read image data
        image_data = await image.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')

        # Prepare prompt for Gemini
        prompt = """
        Analyze this image and identify if it's a cultural or religious place (temple, mosque, church, shrine, gurdwara, synagogue, pagoda, etc.).
        
        Return a JSON response with the following structure:
        {
            "place_type": "The type of place (e.g., Hindu Temple, Mosque, Christian Church, Buddhist Pagoda, etc.)",
            "description": "A brief 2-3 sentence description of what this place is",
            "respectful_tips": [
                "Tip 1: Specific respectful behavior for this type of place",
                "Tip 2: Dress code or etiquette",
                "Tip 3: Photography or behavioral guidelines",
                "Tip 4: Any other important cultural consideration"
            ],
            "cultural_significance": "2-3 sentences explaining why this place is culturally or religiously significant"
        }
        
        If the image is NOT a cultural/religious place, return:
        {
            "place_type": "Not a cultural/religious place",
            "description": "This does not appear to be a recognized cultural or religious site.",
            "respectful_tips": ["Please upload an image of a temple, mosque, church, or other cultural site."],
            "cultural_significance": "N/A"
        }
        
        Important: Return ONLY valid JSON, no markdown formatting, no code blocks.
        """

        # Create Gemini model and generate response
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Prepare image part
        image_part = {
            "mime_type": image.content_type,
            "data": image_base64
        }
        
        response = model.generate_content([prompt, image_part])
        
        # Parse the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        result = json.loads(response_text)
        
        return CulturalAnalysisResponse(
            place_type=result.get("place_type", "Unknown"),
            description=result.get("description", ""),
            respectful_tips=result.get("respectful_tips", []),
            cultural_significance=result.get("cultural_significance", "")
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
