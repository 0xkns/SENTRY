# SENTRY
SENTRY (Secure ENgine for Trusted RAG Yield) makes sure your AI assistant only sees what you’re allowed to see — nothing more, nothing less — and always explains why.

## Problem Statement

Vanilla RAG pipelines are unsafe for enterprise and sensitive applications because they:
- Lack input filtering against malicious queries
- Leak sensitive or excessive data during retrieval
- Do not enforce role-based access control
- Miss auditability for compliance requirements

SENTRY solves this by introducing dual-gates (query and context) and policy-driven enforcement.

<img width="872" height="378" alt="image" src="https://github.com/user-attachments/assets/926504ee-1b93-477c-955d-e97517733be2" />

## Theme
- Privacy-first → Minimal exposure of sensitive data
- Policy-driven → Compliance checks at each step
- Role-aware → Tenant-based AuthN/Z filters
- Auditable → Logs all allow/deny actions
- Safe-by-design → Dual-gate retrieval ensures trust

## Tech Stack
- React Web-based application
- FastAPI Backend + SQLite DB
- FAISS for vector search + Sentence Transformers with Scrambling for Embedding
- Git + GitHub for Version Control

## Features
1. Linear Transformation based scrambling for embeddings
1. Diffie Hellman Key-Exchange for Matrix Scrambling Key
1. Query Prompt Guarding against unsafe/malicious inputs using regex
1. Access control via Authentication & Authorization filters using JWT
1. Context Minimization to reduce sensitive exposure
1. Audit Logging for traceability

## End-to-End Workflow

Client submits a query → Prompt Guard filters unsafe input → SENTRY Gateway applies compliance policies → Authorization Filters validate user access rights → Context Minimizer reduces data exposure → Audit Log records the decision trail → LLM generates a safe, context-aware response
