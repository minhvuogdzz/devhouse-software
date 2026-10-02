from sqlalchemy import Column, Integer, TIMESTAMP, Text, func
from sqlalchemy.orm import Session
from config_db import Base

class ChatbotHistory(Base):
    __tablename__ = "chatbot_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

    @staticmethod
    async def add_message(db: Session, user_id: int, message: str, response: str):
        new_chat = ChatbotHistory(user_id=user_id, message=message, response=response)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat