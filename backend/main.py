import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
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
    # Join dengan muadzins untuk mendapatkan nama
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
    # Simpan atau update subscription di database
    sub_data = {
        "user_id": str(sub.user_id),
        "subscription": sub.subscription.model_dump()
    }
    
    # Gunakan upsert agar jika user ganti browser/device tetap terupdate
    response = supabase.table("push_subscriptions").upsert(
        sub_data, on_conflict="user_id"
    ).execute()
    
    return {"status": "success", "message": "Berhasil terdaftar untuk notifikasi"}

# --- Sistem Notifikasi Otomatis (Background Worker) ---

async def send_push_notification(subscription, message):
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps({"title": "Jadwal Muadzin", "body": message}),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return True
    except WebPushException as ex:
        print("Gagal kirim push:", ex)
        return False

async def check_and_send_notifications():
    while True:
        try:
            # 1. Hitung waktu sekarang + 15 menit
            now = datetime.now()
            target_time = (now + timedelta(minutes=15)).strftime("%H:%M:00")
            today = now.strftime("%Y-%m-%d")

            print(f"[{now.strftime('%H:%M:%S')}] Mengecek jadwal untuk pukul {target_time}...")

            # 2. Cari jadwal yang sesuai, sudah di-claim, dan belum di-notif
            # Query: schedules where date=today and adhan_time=target_time and muadzin_id is not null and is_notified=false
            res = supabase.table("schedules").select("*, muadzins(name)").eq("date", today).eq("adhan_time", target_time).not_().is_("muadzin_id", "null").eq("is_notified", False).execute()

            for schedule in res.data:
                muadzin_id = schedule['muadzin_id']
                prayer = schedule['prayer_time']
                
                # 3. Cari subscription muadzin tersebut
                sub_res = supabase.table("push_subscriptions").select("subscription").eq("user_id", muadzin_id).execute()
                
                if sub_res.data:
                    subscription = sub_res.data[0]['subscription']
                    message = f"Assalamu'alaikum, 15 menit lagi waktu {prayer}. Mohon bersiap untuk Adzan."
                    
                    success = await send_push_notification(subscription, message)
                    
                    if success:
                        # 4. Tandai sudah di-notif agar tidak dobel
                        supabase.table("schedules").update({"is_notified": True}).eq("id", schedule['id']).execute()
                        print(f"Notifikasi {prayer} berhasil dikirim ke muadzin {schedule['muadzins']['name']}")

        except Exception as e:
            print("Error di Background Task:", e)

        # Tunggu 60 detik sebelum pengecekan berikutnya
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    # Jalankan background task saat server mulai
    asyncio.create_task(check_and_send_notifications())
