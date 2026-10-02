import os
import httpx
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.document import Document

class APIClient:
    def __init__(self):
        self.NODE_API_URL = f"http://localhost:{os.getenv('PORT', 3000)}/api"
        self.VECTOR_WORDS_PATH = "src/extensions/chatbot/vector_words"
        self.VECTOR_DB_WORDS_PATH = os.path.join(self.VECTOR_WORDS_PATH, "database")
    
    async def fetch_api(self, endpoint):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.NODE_API_URL}/{endpoint}")
            if response.status_code == 200:
                return response.json()
            return []

    async def get_products(self):
        return await self.fetch_api("products/")

    async def get_reviews_by_product(self, product_id):
        return await self.fetch_api(f"reviews/{product_id}")

    async def get_categories(self):
        return await self.fetch_api("products/categories")
    
    async def get_my_id(self):
        me = await self.fetch_api("me")
        if me:
            return int(me['id'])
        return None

    async def update_vector_db_words(self, embedding_model):
        products = await self.get_products()
        categories = await self.get_categories()

        documents = []
        if products:
            for product in products:
                category = f"{product['category_id']}"

                reviews_data = await self.get_reviews_by_product(product['id'])

                if isinstance(reviews_data, dict) and "reviews" in reviews_data:
                    reviews = reviews_data["reviews"]
                else:
                    reviews = []

                review_text = "\n".join([
                    f"- {review['user_id']}: {review['comment']} (⭐ {review['rating']})"
                    for review in reviews
                ]) if reviews else "No reviews yet."

                text = f"""
                Product: {product['name']}, 
                Price: {product['price']}, 
                Description: {product['description']},
                Stock: {product['stock']},
                Category: {categories.get(category, 'Unknown')},
                Reviews: {review_text}"""

                documents.append(Document(page_content=text))

        if documents:
            self.data_db = FAISS.from_documents(documents, embedding_model)
            self.data_db.save_local(self.VECTOR_DB_WORDS_PATH)