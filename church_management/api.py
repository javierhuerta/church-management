from ninja import NinjaAPI
from calendar_app.api import router as calendar_router

api = NinjaAPI(title="Church Management API", version="1.0")
api.add_router("/events/", calendar_router)
