from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel


# User Models
class UserCreate(BaseModel):
    org_id: Union[str, int]  # Accept both string and int
    name: str
    role: str
    clearance: str


class User(BaseModel):
    user_id: str
    org_id: Union[str, int]  # Accept both string and int
    name: str
    role: str
    clearance: str
    org_name: str


# Document Models
class DocumentIngest(BaseModel):
    org_id: Union[str, int]  # Accept both string and int
    title: str
    content: str
    sensitivity: int = 5
    acl_roles: List[str] = ["employee"]


class DocumentResponse(BaseModel):
    doc_id: str
    chunks_created: int
    chunks: List[Dict[str, Any]]
    pii_stats: Dict[str, Any]


# Query Models
class QueryRequest(BaseModel):
    query: str
    purpose: str = "general"
    max_chunks: int = 3


class QueryResponse(BaseModel):
    answer: str
    citations: List[Dict[str, Any]]
    audit: Dict[str, Any]
    query_id: str


# Audit Models
class AuditLog(BaseModel):
    query_id: str
    decisions: List[Dict[str, Any]]
    summary: Dict[str, Any]


# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    user_id: int
    org_id: int
    password: str
