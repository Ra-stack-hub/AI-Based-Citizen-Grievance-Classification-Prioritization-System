from sentence_transformers import SentenceTransformer, util
import logging

logger = logging.getLogger(__name__)

class DuplicateDetector:
    def __init__(self):
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.error(f"Failed to load sentence transformer model: {e}")
            self.model = None
            
        self.similarity_threshold = 0.85

    def get_embedding(self, text: str):
        if not self.model:
            return None
        return self.model.encode(text, convert_to_tensor=True)

    def is_duplicate(self, new_embedding, existing_embeddings) -> bool:
        if not self.model or new_embedding is None or len(existing_embeddings) == 0:
            return False, None
            
        # Compare with existing embeddings
        cosine_scores = util.cos_sim(new_embedding, existing_embeddings)
        max_score = cosine_scores.max().item()
        
        if max_score > self.similarity_threshold:
            # Return True and the index of the matching existing complaint
            return True, cosine_scores.argmax().item()
            
        return False, None

duplicate_service = DuplicateDetector()
