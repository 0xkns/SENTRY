import hashlib
import uuid

from app.db import get_db_connection
from app.safe_faiss import SafeFAISS
from app.schemas.base import (
    DocumentIngest,
    DocumentResponse,
    QueryRequest,
    QueryResponse,
)
from app.services.auth import detect_prompt_injection
from app.services.embedding import chunk_text
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/ingest", response_model=DocumentResponse)
async def ingest(doc: DocumentIngest):
    """Ingest a document and create chunks"""
    # Convert org_id to string for comparison
    # user_org_id = str(user["org_id"])
    # doc_org_id = str(doc.org_id)

    # if doc_org_id != user_org_id:
    #     raise HTTPException(
    #         status_code=403, detail="Cannot ingest documents for other organizations"
    #     )

    doc_id = str(uuid.uuid4())

    # Use the actual document content, not fetched docs
    content_hash = hashlib.sha256(doc.content.encode()).hexdigest()

    # Chunk the actual document content
    paragraphs = chunk_text(doc.content)  # Fixed: use doc.content instead of docs[0][1]

    # Insert chunks
    chunks_created = []
    for i, paragraph in enumerate(paragraphs):
        chunks_created.append(
            {
                "chunk_id": str(uuid.uuid4()),
                "doc_id": doc_id,
                "org_id": doc.org_id,
                "text": paragraph,
                "sensitivity": doc.sensitivity,
            }
        )

    # Build FAISS index
    print("sdasd:", chunks_created)
    SafeFAISS.build(chunks_created, user_id=101, org_id=1)

    return DocumentResponse(
        doc_id=doc_id,
        chunks_created=len(chunks_created),
        chunks=chunks_created,
        pii_stats={},  # Placeholder for PII statistics
    )


@router.post("/query", response_model=QueryResponse)
async def query(query: QueryRequest):
    """Query documents and retrieve relevant information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    if detect_prompt_injection(query.query):
        cursor.execute(
            """
            INSERT INTO audit_logs (
                log_id, query_id, user_id, org_id, query, decisions, allowed_chunks, denied_chunks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                str(uuid.uuid4()),
                101,
                1,
                query.query,
                "disallowed",
                1,
                0,
            ),
        )

        raise HTTPException(status_code=400, detail="Prompt injection detected")

    # if not user:
    #     raise HTTPException(status_code=401, detail="Unauthorized")

    results = SafeFAISS.search(query.query, k=1, user_id=1)
    print(results[0])

    cursor.execute(
        """
        SELECT text, sensitivity, pii_tags
        FROM chunks
        WHERE chunk_id = ?
    """,
        (results[1][1][2],),
    )
    doc_data = cursor.fetchone()
    print("jsjda:", doc_data)

    cursor.execute(
        """
        INSERT INTO audit_logs (
            log_id, query_id, user_id, org_id, query, decisions, allowed_chunks, denied_chunks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(uuid.uuid4()),
            str(uuid.uuid4()),
            results[1][0][2],
            results[1][0][1],
            query.query,  # query
            "allowed",
            1,
            0,
        ),
    )

    conn.commit()
    conn.close()

    return QueryResponse(
        answer=doc_data[0],
        citations=[{}],
        audit={},
        query_id=str(uuid.uuid4()),
    )
