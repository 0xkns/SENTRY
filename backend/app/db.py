import sqlite3


def get_db_connection():
    """Get database connection"""
    return sqlite3.connect("docs.db")


def init_db():
    """Initialize database tables and demo data"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    _create_tables(cursor)

    # Create demo data
    _create_demo_data(cursor)

    conn.commit()
    conn.close()


def _create_tables(cursor):
    """Create all database tables"""
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS organizations (
            org_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            clearance TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (org_id) REFERENCES organizations (org_id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            doc_id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            title TEXT NOT NULL,
            sensitivity TEXT NOT NULL,
            acl_roles TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (org_id) REFERENCES organizations (org_id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS chunks (
            chunk_id TEXT PRIMARY KEY,
            doc_id TEXT NOT NULL,
            text TEXT NOT NULL,
            embedding BLOB NOT NULL,
            sensitivity TEXT NOT NULL,
            pii_tags TEXT NOT NULL,
            FOREIGN KEY (doc_id) REFERENCES documents (doc_id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id TEXT PRIMARY KEY,
            query_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            org_id TEXT NOT NULL,
            query TEXT NOT NULL,
            decisions TEXT NOT NULL,
            allowed_chunks INTEGER NOT NULL,
            denied_chunks INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )


def _create_demo_data(cursor):
    """Create demo organizations and users"""
    # Demo organizations
    cursor.execute(
        "INSERT OR IGNORE INTO organizations (org_id, name) VALUES (?, ?)",
        ("org1", "Acme Corp"),
    )
    cursor.execute(
        "INSERT OR IGNORE INTO organizations (org_id, name) VALUES (?, ?)",
        ("org2", "TechCorp Inc"),
    )

    # Demo users
    users = [
        ("user1", "org1", "Alice Johnson", "employee", "employee"),
        ("user2", "org1", "Bob Smith", "manager", "manager"),
        ("user3", "org1", "Carol HR", "hr", "hr"),
        ("user4", "org2", "Dave External", "employee", "employee"),
    ]

    for user in users:
        cursor.execute(
            "INSERT OR IGNORE INTO users (user_id, org_id, name, role, clearance) VALUES (?, ?, ?, ?, ?)",
            user,
        )
