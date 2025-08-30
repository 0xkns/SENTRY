import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import settings

# Initialize embedding model
embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)


def scramble_embedding(text: str) -> np.ndarray:
    """Generate scrambled embedding for text"""
    embedding = embedding_model.encode([text])[0]
    # scramble_matrix = generate_scramble_matrix(len(embedding))
    scramble_matrix = np.identity(
        len(embedding)
    )  # Use identity matrix for no scrambling
    print(scramble_matrix)
    return np.dot(scramble_matrix, embedding)


def unscramble_embedding(
    scrambled: np.ndarray, rotation_matrix: np.ndarray
) -> np.ndarray:
    return np.dot(rotation_matrix.T, scrambled)  # Transpose = inverse for rotation


def calculate_similarity(
    query_embedding: np.ndarray, chunk_embedding: np.ndarray
) -> float:
    """Calculate cosine similarity between embeddings"""
    return cosine_similarity([query_embedding], [chunk_embedding])[0][0]


def chunk_text(text: str) -> list:
    """Simple text chunking by paragraphs"""
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    return paragraphs


def embedding_to_bytes(embedding: np.ndarray) -> bytes:
    """Convert embedding to bytes for database storage"""
    return embedding.tobytes()


def bytes_to_embedding(embedding_bytes: bytes) -> np.ndarray:
    """Convert bytes back to embedding"""
    return np.frombuffer(embedding_bytes, dtype=np.float32)
