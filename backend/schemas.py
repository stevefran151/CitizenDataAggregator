from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ObservationBase(BaseModel):
    type: str # air, water, soil, noise
    value: float # Primary summary value (e.g. AQI)
    lat: float
    long: float
    location_name: Optional[str] = None
    details: Optional[dict] = None # Full parameters (e.g. {ph: 7, do: 5})
    is_expert: bool = False

class ObservationCreate(ObservationBase):
    pass

class Observation(ObservationBase):
    id: int
    is_valid: bool
    timestamp: datetime
    source: str
    outlier_score: Optional[float]
    needs_review: bool
    validation_status: str
    is_expert: bool

    # Computed fields
    quality_label: Optional[str]
    color_code: Optional[str]
    health_msg: Optional[str]
    validation_report: Optional[dict]

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    user_name: str
    email: str
    category: str
    message: str

class Feedback(FeedbackCreate):
    id: int
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    query: str
    context: Optional[dict] = None
