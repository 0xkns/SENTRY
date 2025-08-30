from app.db import get_db_connection
from app.schemas.base import LoginRequest, Token
from app.services.auth import create_access_token
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT *
        FROM users_login_data
        WHERE user_id = ? AND org_id = ? AND password = ?
        """,
        (
            req.user_id,
            req.org_id,
            req.password,
        ),
    )
    user = cursor.fetchone()
    conn.commit()
    conn.close()

    if user:
        access_token = create_access_token(req.user_id)
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/users")
async def list_demo_users():
    """List all demo users"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.user_id, u.name, u.role, u.clearance, o.name as org_name
        FROM users u
        JOIN organizations o ON u.org_id = o.org_id
    """
    )
    users = cursor.fetchall()
    conn.close()

    user_list = [
        {
            "user_id": user[0],
            "name": user[1],
            "role": user[2],
            "clearance": user[3],
            "org_name": user[4],
        }
        for user in users
    ]

    return {"users": user_list}
