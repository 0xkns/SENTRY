from typing import Dict, List, Optional

import faiss
import numpy as np

from app.db import get_db_connection
from app.services.embedding import scramble_embedding


# ---- Build FAISS index with user_id mapping ----
class SafeFAISS:
    _index: Optional[faiss.Index] = None
    _meta: Optional[Dict] = None

    @classmethod
    def build(cls, docs: List[str], user_id: int, org_id: int):
        conn = get_db_connection()
        cursor = conn.cursor()
        cls._index = faiss.IndexFlatL2(384)
        cls._meta = {}  # faiss_id → (user_id, doc_id)
        embeddings = []
        for idx, doc in enumerate(docs):
            emb = scramble_embedding(doc["text"])
            cursor.execute(
                """
            INSERT INTO chunks (chunk_id, doc_id, text, embedding, sensitivity, pii_tags)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
                (
                    doc["chunk_id"],
                    doc["doc_id"],
                    doc["text"],
                    emb,
                    doc["sensitivity"],
                    "",
                ),
            )
            embeddings.append(emb)
            cls._meta[len(cls._meta)] = (org_id, user_id, doc["chunk_id"])

        embeddings = np.stack(embeddings)
        cls._index.add(embeddings)
        conn.commit()
        conn.close()

    @classmethod
    def search(cls, query, k=1, user_id=None):
        query_emb = np.array([scramble_embedding(query)], dtype="float32")
        D, indices = cls._index.search(query_emb, k)

        results = []
        for idx in indices[0]:
            if idx == -1:
                continue
            (
                org_id,
                user_id,
                chunk_id,
            ) = cls._meta[idx]
            if user_id is None and org_id == user_id:
                results.append((user_id, org_id, chunk_id))

        print(cls._meta)
        return indices, cls._meta
