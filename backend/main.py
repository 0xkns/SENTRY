from contextlib import asynccontextmanager

from app.db import init_db
from app.routes.endpoints import auth, documents
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database and demo data...")
    init_db()

    # Create demo data
    # conn = get_db_connection()
    # cursor = conn.cursor()

    # # Demo organizations
    # cursor.execute(
    #     "INSERT OR IGNORE INTO organizations (org_id, name) VALUES (?, ?)",
    #     ("org1", "Acme Corp"),
    # )
    # cursor.execute(
    #     "INSERT OR IGNORE INTO organizations (org_id, name) VALUES (?, ?)",
    #     ("org2", "TechCorp Inc"),
    # )

    # # Demo users
    # users = [
    #     ("user1", "org1", "Alice Johnson", "employee", "employee"),
    #     ("user2", "org1", "Bob Smith", "manager", "manager"),
    #     ("user3", "org1", "Carol HR", "hr", "hr"),
    #     ("user4", "org2", "Dave External", "employee", "employee"),
    # ]

    # for user in users:
    #     cursor.execute(
    #         "INSERT OR IGNORE INTO users (user_id, org_id, name, role, clearance) VALUES (?, ?, ?, ?, ?)",
    #         user,
    #     )

    yield

    # conn.commit()
    # conn.close()


app = FastAPI(
    title="SENTRY",
    version="0.0.1",
    description="Secure Engine Trusted RAG Yield",
    lifespan=lifespan,
)
# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
# app.include_router(query.router, prefix="/query", tags=["query"])
# app.include_router(audit.router, prefix="/audit", tags=["audit"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/")
# async def home():
#     return {"message": "Welcome to the SENTRY API"}


# @app.get("/login")
# def login():
#     return {"message": "Welcome to the SENTRY API"}


# @app.get("/signup")
# def signup():
#     return {"message": "Welcome to the SENTRY API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
