import os
import json
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pywebpush import webpush, WebPushException
from dotenv import load_dotenv

from database import supabase
from models import ScheduleResponse, MuadzinResponse, ScheduleUpdate, PushSubscriptionCreate

load_dotenv()

app = FastAPI(title="Muadzin Scheduler API")

# Load VAPID Keys
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": "mailto:admin@muadzinapp.com"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint Utama ---

@app.get("/api/v1/schedules", response_model=List[ScheduleResponse])
def get_schedules(date: str = Query(..., description="Format YYYY-MM-DD")):
    response = supabase.table("schedules").select("*, muadzins(name)").eq("date", date).execute()
    return response.data

@app.get("/api/v1/muadzins", response_model=List[MuadzinResponse])
def get_muadzins():
    response = supabase.table("muadzins").select("*").execute()
    return response.data

@app.put("/api/v1/schedules/{schedule_id}", response_model=ScheduleResponse)
def update_schedule_muadzin(schedule_id: UUID, schedule: ScheduleUpdate):
    response = supabase.table("schedules").update(
        {"muadzin_id": str(schedule.muadzin_id), "is_notified": False}
    ).eq("id", str(schedule_id)).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Gagal mengupdate jadwal")
    return response.data[0]

@app.post("/api/v1/push/subscribe")
def subscribe_to_push(sub: PushSubscriptionCreate):
    sub_data = {
        "user_id": str(sub.user_id),
        "subscription": sub.subscription.model_dump()
    }
    response = supabase.table("push_subscriptions").upsert(
        sub_data, on_conflict="user_id"
    ).execute()
    return {"status": "success", "message": "Berhasil terdaftar untuk notifikasi"}

# --- Cron Job Endpoint (Dipanggil Vercel) ---

async def send_push_notification(subscription, message):
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps({"title": "Jadwal Muadzin Masjid Thaybah", "body": message}),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return True
    except WebPushException as ex:
        print("Gagal kirim push:", ex)
        return False

@app.get("/api/v1/cron/reminders")
async def cron_reminders():
    """
    Endpoint ini akan dipanggil oleh Vercel Cron setiap 10 menit.
    Mengecek jadwal yang akan tiba dalam rentang 5-20 menit ke depan.
    """
    try:
        now = datetime.now()
        today = now.strftime("%Y-%m-%d")
        
        # Kita cari jadwal yang akan tiba dalam 15 menit ke depan (plus minus 5 menit untuk safety)
        # Karena Cron jalan tiap 10 menit, rentang ini memastikan tidak ada yang terlewat.
        start_range = (now + timedelta(minutes=5)).strftime("%H:%M:00")
        end_range = (now + timedelta(minutes=20)).strftime("%H:%M:00")

        print(f"[{now.strftime('%H:%M:%S')}] Cron Checking: {start_range} s/d {end_range}")

        # Query: schedules where date=today and adhan_time between range and muadzin_id is not null and is_notified=false
        res = supabase.table("schedules").select("*, muadzins(name)")\
            .eq("date", today)\
            .gte("adhan_time", start_range)\
            .lte("adhan_time", end_range)\
            .not_().is_("muadzin_id", "null")\
            .eq("is_notified", False)\
            .execute()

        sent_count = 0
        for schedule in res.data:
            muadzin_id = schedule['muadzin_id']
            prayer = schedule['prayer_time']
            
            sub_res = supabase.table("push_subscriptions").select("subscription").eq("user_id", muadzin_id).execute()
            
            if sub_res.data:
                subscription = sub_res.data[0]['subscription']
                message = f"Assalamu'alaikum, waktu {prayer} akan tiba sekitar 15 menit lagi. Mohon bersiap untuk Adzan."
                
                success = await send_push_notification(subscription, message)
                
                if success:
                    supabase.table("schedules").update({"is_notified": True}).eq("id", schedule['id']).execute()
                    print(f"Notifikasi {prayer} terkirim ke {schedule['muadzins']['name']}")
                    sent_count += 1

        return {"status": "success", "checked_range": f"{start_range}-{end_range}", "notifications_sent": sent_count}

    except Exception as e:
        print("Cron Error:", e)
        return {"status": "error", "message": str(e)}
