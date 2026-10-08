import logging
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Sample Civic Knowledge Base Document (Chunks)
CIVIC_KNOWLEDGE_BASE = [
    {
        "id": "doc1",
        "title": "Garbage Collection Rules",
        "content": "Garbage collection happens every Monday and Thursday morning. Wet waste must be separated from dry waste. Electronics and hazardous materials will not be picked up by regular trucks and require scheduling a special pickup.",
        "source": "Municipal Solid Waste Guidelines 2025"
    },
    {
        "id": "doc2",
        "title": "Pothole Reporting and Repair",
        "content": "Potholes on major arterial roads are repaired within 48 hours of reporting. Potholes on residential streets may take up to 7 days. If a pothole causes vehicle damage, a claim can be filed with the road transport department within 30 days.",
        "source": "Public Works Department Manual"
    },
    {
        "id": "doc3",
        "title": "Noise Complaints",
        "content": "Loud music and construction noise are prohibited between 10:00 PM and 6:00 AM in residential zones. During festival seasons, exceptions may be granted up to midnight. Violations carry a fine of $500.",
        "source": "City Ordinance Code Title 9"
    },
    {
        "id": "doc4",
        "title": "Streetlight Outages",
        "content": "Streetlight outages can be reported online. The electrical department aims to fix broken streetlights within 3 to 5 business days. Mass outages spanning multiple blocks are treated as high priority emergencies.",
        "source": "Electrical Division FAQ"
    },
    {
        "id": "doc5",
        "title": "Water Supply Interruptions",
        "content": "Planned water supply interruptions will be notified at least 24 hours in advance via SMS. Unplanned interruptions due to pipe bursts will be resolved as quickly as possible. Residents are advised to boil water for 48 hours after a major repair.",
        "source": "Water Board Advisory"
    }
]

class AdvancedRAGService:
    def __init__(self):
        self.documents = [doc["content"] for doc in CIVIC_KNOWLEDGE_BASE]
        self.metadata = CIVIC_KNOWLEDGE_BASE
        
        # 1. Sparse Retrieval (Keyword) Setup
        try:
            self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.documents)
        except Exception as e:
            logger.error(f"Failed to initialize TF-IDF: {e}")
            self.tfidf_vectorizer = None

        # 2. Dense Retrieval (Semantic) Setup
        try:
            # Using a lightweight, fast model for CPU inference
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            self.dense_matrix = self.encoder.encode(self.documents, convert_to_tensor=False)
        except Exception as e:
            logger.error(f"Failed to initialize SentenceTransformer: {e}")
            self.encoder = None

    def sparse_search(self, query: str) -> dict:
        """TF-IDF based keyword search"""
        if not self.tfidf_vectorizer:
            return {}
        query_vec = self.tfidf_vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Create ranking dictionary: { doc_index: score }
        ranks = {i: score for i, score in enumerate(similarities)}
        return ranks

    def dense_search(self, query: str) -> dict:
        """Sentence-Transformer based semantic search"""
        if not self.encoder:
            return {}
        query_vec = self.encoder.encode([query])
        # cosine similarity
        similarities = cosine_similarity(query_vec, self.dense_matrix).flatten()
        
        ranks = {i: score for i, score in enumerate(similarities)}
        return ranks

    def hybrid_search_rrf(self, query: str, k: int = 60) -> list:
        """
        Reciprocal Rank Fusion (RRF)
        Combines sparse and dense search results.
        RRF_score = 1 / (k + rank)
        """
        sparse_scores = self.sparse_search(query)
        dense_scores = self.dense_search(query)
        
        # Sort by score descending to get ranks
        sparse_ranked = sorted(sparse_scores.items(), key=lambda item: item[1], reverse=True)
        dense_ranked = sorted(dense_scores.items(), key=lambda item: item[1], reverse=True)
        
        rrf_scores = {i: 0.0 for i in range(len(self.documents))}
        
        # Apply RRF for Sparse
        for rank, (doc_idx, score) in enumerate(sparse_ranked):
            if score > 0: # Only consider if there's some match
                rrf_scores[doc_idx] += 1.0 / (k + rank + 1)
                
        # Apply RRF for Dense
        for rank, (doc_idx, score) in enumerate(dense_ranked):
            if score > 0:
                rrf_scores[doc_idx] += 1.0 / (k + rank + 1)
                
        # Final combined ranking
        final_ranking = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)
        return final_ranking

    def generate_response(self, query: str) -> dict:
        """
        Retrieves top context and generates an anti-hallucinated response.
        """
        ranked_results = self.hybrid_search_rrf(query)
        
        if not ranked_results:
            return {
                "answer": "I don't have enough information to answer that. Please contact support.",
                "confidence": 0.0,
                "source": None
            }
            
        top_doc_idx, top_score = ranked_results[0]
        
        # Anti-Hallucination Threshold Check
        # If the RRF score is very low, it means neither keyword nor semantic search found a good match.
        if top_score < 0.02: 
            return {
                "answer": "I could not find a reliable answer to your question in our civic database. To prevent hallucinating information, I recommend calling the municipal helpline.",
                "confidence": round(top_score, 4),
                "source": None
            }
            
        best_match = self.metadata[top_doc_idx]
        
        # Simple extraction/generation (In a full RAG, you'd pass this context to an LLM like GPT-4)
        # Here we do extractive QA for speed and determinism
        answer = f"Based on our civic guidelines: {best_match['content']}"
        
        return {
            "answer": answer,
            "confidence": round(top_score, 4),
            "source": best_match['source'],
            "title": best_match['title']
        }

rag_service = AdvancedRAGService()
