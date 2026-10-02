import uvicorn
import os
from config_db import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chatbot_routes import router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{int(os.getenv("PORT", 3000))}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router, prefix="/api", tags=["Chatbot"])

port = int(os.getenv("CHAT_PORT", 8000))

@app.get("/")
async def root():
    return {"message": f"Chatbot server đang chạy tại http://localhost:{port}"}

def start():
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

if __name__ == "__main__":
    start()
