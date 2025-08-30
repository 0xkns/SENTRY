import json
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Tuple

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.db import get_db_connection

security = HTTPBearer()


def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expires_delta = timedelta(seconds=settings.JWT_EXPIRATION)
    expire = datetime.now(timezone.utc) + expires_delta

    payload = {"user_id": user_id, "exp": expire}

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Extract user info from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user data from database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.user_id, u.org_id, u.name, u.role, u.clearance, o.name as org_name
            FROM users u
            JOIN organizations o ON u.org_id = o.org_id
            WHERE u.user_id = ?
        """,
            (user_id,),
        )

        user_data = cursor.fetchone()
        conn.close()

        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")

        return {
            "user_id": user_data[0],
            "org_id": user_data[1],
            "name": user_data[2],
            "role": user_data[3],
            "clearance": user_data[4],
            "org_name": user_data[5],
        }
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def detect_prompt_injection(query: str) -> bool:
    """Detect potential prompt injection attempts"""
    injection_patterns = [
        r"ignore\s+(previous\s+)?instructions?",
        r"system\s+prompt",
        r"act\s+as\s+(?:admin|root|system)",
        r"show\s+(?:all\s+)?(?:data|database|secrets?|passwords?)",
        r"print\s+(?:database|secrets?|all)",
        r"\/\*.*\*\/",
        r"<script>",
        r"ignore\s+this",
        r"delete\s+from",
        r"insert\s+into",
        r"DROP\s+TABLE",
        r"SELECT\s+\*\s+FROM",
    ]

    for pattern in injection_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            return True
    return False


def calculate_sensitivity_score(chunk_data: Dict) -> float:
    """Calculate sensitivity score for a chunk"""
    base_scores = {
        "public": 0.0,
        "confidential": 0.4,
        "restricted": 0.8,
    }

    base_score = base_scores.get(chunk_data["sensitivity"], 0.5)
    pii_tags = json.loads(chunk_data["pii_tags"])
    pii_penalty = 0.2 * len(pii_tags)

    return min(1.0, base_score + pii_penalty)


def check_policy(chunk_data: Dict, user_data: Dict, purpose: str) -> Tuple[str, str]:
    """Check if chunk access is allowed based on policies"""

    # Policy 1: Cross-tenant check
    if chunk_data["org_id"] != user_data["org_id"]:
        return ("deny", "cross-tenant access not allowed")

    # Policy 2: Clearance level check
    clearance_hierarchy = {"employee": 0, "manager": 1, "hr": 2, "admin": 3}
    sensitivity_requirements = {
        "public": 0,
        "internal": 0,
        "confidential": 1,
        "restricted": 2,
    }

    user_clearance = clearance_hierarchy.get(user_data["clearance"], 0)
    required_clearance = sensitivity_requirements.get(chunk_data["sensitivity"], 0)

    if user_clearance < required_clearance:
        return (
            "deny",
            f"insufficient clearance: {user_data['clearance']} < required level",
        )

    # Policy 3: PII purpose check
    pii_tags = json.loads(chunk_data["pii_tags"])
    if "ssn" in pii_tags and purpose != "dsar":
        return ("deny", "SSN access requires DSAR purpose")

    if "salary" in pii_tags and user_data["role"] not in ["hr", "admin"]:
        return ("deny", "salary information requires HR/admin role")

    # Policy 4: ACL check
    acl_roles = json.loads(chunk_data["acl_roles"])
    if user_data["role"] not in acl_roles and "all" not in acl_roles:
        return ("deny", f"role {user_data['role']} not in ACL: {acl_roles}")

    return ("allow", "policy check passed")
