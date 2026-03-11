import os
import base64
import io
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter()

class MemoryCompleteRequest(BaseModel):
    base_image: str  # Base64 string of the background photo
    person_image: str # Base64 string of the missing person

@router.post("/complete")
async def complete_memory(request: MemoryCompleteRequest):
    """
    Takes a base image and a person image, uses Gemini 3.1 Flash Image to combine them,
    and returns a base64 encoded composite image.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")

    if not request.base_image or not request.person_image:
        raise HTTPException(status_code=400, detail="Missing images")

    try:
        # 1. Initialize the new genai client
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # 2. Decode the base64 images into PIL Images so the SDK can handle them
        base_img_bytes = base64.b64decode(request.base_image)
        person_img_bytes = base64.b64decode(request.person_image)
        
        base_pil = Image.open(io.BytesIO(base_img_bytes))
        person_pil = Image.open(io.BytesIO(person_img_bytes))
        
        prompt = (
            "I am providing two images. First is a base travel photo which may already have a person in it. "
            "Second is a portrait of a different person. "
            "CRITICAL INSTRUCTION: DO NOT replace the person in the base photo! "
            "Add the new person from the second photo INTO the scene, standing NEXT TO the person in the base photo. "
            "Adjust lighting, scale, and shadows so both people look like they are in a real, single photograph together."
        )
        
        # 3. Call the generation model requested by user
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=[prompt, base_pil, person_pil],
        )
        
        # 4. Extract the generated image from the parts
        output_base64 = None
        
        if not response.parts:
            # Maybe safety filters triggered or the model returned an empty response
            print("WARNING: response.parts is None or empty. Full response:", response)
            raise HTTPException(status_code=500, detail=f"Model did not return any parts. Raw response: {response}")
            
        for part in response.parts:
            if getattr(part, "inline_data", None) is not None:
                # The inline_data itself has the raw bytes in .data
                raw_bytes = part.inline_data.data
                output_base64 = base64.b64encode(raw_bytes).decode("utf-8")
                break
                
        if output_base64:
            return {"result": output_base64}
        else:
            raise HTTPException(status_code=500, detail="Model did not return an image part.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
