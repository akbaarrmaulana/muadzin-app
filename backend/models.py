from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, time
from uuid import UUID

# --- Muadzin Models ---
class MuadzinBase(BaseModel):
    name: str
    contact_id: Optional[str] = None

class MuadzinCreate(MuadzinBase):
    pass

class MuadzinResponse(MuadzinBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- Schedule Models ---
class ScheduleBase(BaseModel):
    date: date
    prayer_time: str  # Enum: Subuh, Dhuhur, Ashar, Maghrib, Isya
    adhan_time: time
    is_notified: bool = False

class ScheduleCreate(ScheduleBase):
    muadzin_id: Optional[UUID] = None

class ScheduleUpdate(BaseModel):
    muadzin_id: UUID

class ScheduleResponse(ScheduleBase):
    id: UUID
    muadzin_id: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)

# --- Push Notification Models ---
class PushSubscriptionData(BaseModel):
    endpoint: str
    keys: dict

class PushSubscriptionCreate(BaseModel):
    user_id: UUID
    subscription: PushSubscriptionData
