import os
import re
import asyncio
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint, HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain.retrievers import EnsembleRetriever

from api_client import APIClient

load_dotenv()

class LLMChatbot:
    def __init__(self, hf_model="mistralai/Mistral-7B-Instruct-v0.1", embedding_model="sentence-transformers/all-MiniLM-L6-v2"):
        self.HF_API_KEY = os.getenv("HUGGINGFACE_TOKEN")
        self.HF_MODEL = hf_model
        self.VECTOR_WORDS_PATH = "src/extensions/chatbot/vector_words"
        self.VECTOR_DB_WORDS_PATH = os.path.join(self.VECTOR_WORDS_PATH, "database")
        self.VECTOR_GUIDES_WORDS_PATH = os.path.join(self.VECTOR_DB_WORDS_PATH, "guides")

        self.llm = self.load_llm()
        self.embedding_model = self.load_embedding_model(embedding_model)
        self.data_db = self.read_vectors_words(self.VECTOR_DB_WORDS_PATH)
        self.guide_db = self.read_vectors_words(self.VECTOR_GUIDES_WORDS_PATH)
        self.qa_chain = self.create_qa_chain()

        self.api_client = APIClient()

    def load_llm(self):
        return HuggingFaceEndpoint(
            repo_id=self.HF_MODEL,
            temperature=0.01,
            max_new_tokens=512,
            huggingfacehub_api_token=self.HF_API_KEY
        )

    def load_embedding_model(self, embedding_model):
        return HuggingFaceEmbeddings(model_name=embedding_model)

    def read_vectors_words(self, path):
        if os.path.exists(path):
            return FAISS.load_local(path, self.embedding_model, allow_dangerous_deserialization=True)
        return None

    def create_prompt(self):
        template = """
        <<|im_start|>system
        You are a smart virtual assistant for an e-commerce website. You can only answer questions based on the following (only use character and number, not symbolize) topics:
        1. Website Information  
        2. How to use the website  
        3. Product Consultation  
        4. Other general inquiries  
        If the user's question is outside these topics, respond with:  
        "Sorry, I can only answer questions related to our website and services. If you need further assistance, please contact us at Phone: +843949505816 or Email: group11@gmail.com."

        Always ensure your answer is clear, detailed, and concise.  

        {context}  
        <|im_end|>  
        <|im_start|>user  
        {question}  
        <|im_end|>  
        <|im_start|>assistant  
        """
        return PromptTemplate(template=template, input_variables=["context", "question"])

    def clean_response(self, response):
        response = re.split(r'<\|im_end\|>', response, maxsplit=1)[0]
        return response.strip()

    def create_qa_chain(self):
        retrievers = []
        if self.data_db:
            retrievers.append(self.data_db.as_retriever(search_kwargs={"k": 10}))
        if self.guide_db:
            retrievers.append(self.guide_db.as_retriever(search_kwargs={"k": 3}))

        if not retrievers:
            raise ValueError("No vector databases found. Please initialize at least one.")

        retriever = retrievers[0] if len(retrievers) == 1 else EnsembleRetriever(retrievers=retrievers)

        return RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=False,
            chain_type_kwargs={'prompt': self.create_prompt()}
        )

    async def get_response(self, question):
        await self.api_client.update_vector_db_words(self.embedding_model)
        result = self.qa_chain.invoke({"query": question + "?"})["result"]
        return self.clean_response(result)


import asyncio

def main():
    chatbot = LLMChatbot()
    
    async def test_chatbot():
        test_questions = [
            "What is this website about?",
            "How do I place an order?"
        ]
        
        for question in test_questions:
            print(f"\n🔹 Question: {question}")
            response = await chatbot.get_response(question)
            print(type(response))
    
    asyncio.run(test_chatbot())

if __name__ == "__main__":
    main()
