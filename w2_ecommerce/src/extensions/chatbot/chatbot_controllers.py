from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from llm_chatbot import LLMChatbot
from chatbot_history_model import ChatbotHistory

class ChatbotController:
    def __init__(self):
        self.chatbot = LLMChatbot()

    async def get_response(self, message: str, db: Session, background_tasks: BackgroundTasks):
        try:
            response = await self.chatbot.get_response(message)

            api_client = self.chatbot.api_client
            user_id = await api_client.get_my_id()

            result = JSONResponse(status_code=200, content={"response": response})

            background_tasks.add_task(self.save_chat_history, db, user_id, message, response)

            return result

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Chatbot server error: {str(e)}")

    async def save_chat_history(self, db: Session, user_id: int, message: str, response: str):
        await ChatbotHistory.add_message(db, user_id, message, response)