from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class EmergencyContact(BaseModel):
    name: str
    phone: str
    relation: str


class MedicalDetails(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    medical_details: Optional[MedicalDetails] = None
    emergency_contacts: Optional[List[EmergencyContact]] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    medical_details: Optional[dict] = None
    emergency_contacts: Optional[List[dict]] = []
    created_at: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
