from fastapi import BackgroundTasks, APIRouter, Depends, Query
from sqlalchemy.orm import Session

from config_db import get_db
from chatbot_controllers import ChatbotController

router = APIRouter()
chatbot_controller = ChatbotController()

@router.get("/chatbot")
async def get_chatbot_response(
    message: str = Query(..., min_length=1), 
    db: Session = Depends(get_db), 
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    return await chatbot_controller.get_response(message, db, background_tasks)