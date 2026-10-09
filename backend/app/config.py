import os

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Explicit CORS Origins list
_raw_cors = os.getenv("CORS_ORIGINS", "")
if _raw_cors.strip():
    CORS_ORIGINS = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://xogames.app",
    ]

ROOM_TTL_SECONDS = int(os.getenv("ROOM_TTL_SECONDS", "900"))
MAX_ROOMS = int(os.getenv("MAX_ROOMS", "1000"))
MAX_MESSAGE_BYTES = int(os.getenv("MAX_MESSAGE_BYTES", "4096"))

