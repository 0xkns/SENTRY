import os
import sqlite3

import pandas as pd
from pypdf import PdfReader


def init_db(db_path="docs.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # One table for structured CSV
    # cursor.execute(
    #     """
    # CREATE TABLE IF NOT EXISTS salary_data (
    #     id INTEGER PRIMARY KEY AUTOINCREMENT,
    #     Name TEXT,
    #     UserID TEXT,
    #     Department TEXT,
    #     MonthlySalary REAL,
    #     AccountNumber TEXT
    # )
    # """
    # )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS users_login_data (
        user_id INTEGER PRIMARY KEY,
        name TEXT,
        role TEXT,
        org_id INTEGER,
        password TEXT
    )
    """
    )

    # One table for unstructured docs (txt, pdf, md, etc.)
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        content TEXT
    )
    """
    )

    conn.commit()
    conn.close()


def insert_file(file_path, db_path="docs.db"):
    ext = os.path.splitext(file_path)[1].lower()

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    if ext == ".csv":
        df = pd.read_csv(file_path)
        df.to_sql("users_login_data", conn, if_exists="append", index=False)
        print(f"[+] Inserted CSV rows from {file_path} into users login table")

    elif ext == ".pdf":
        reader = PdfReader(file_path)
        pdf_text = "\n".join(
            [page.extract_text() for page in reader.pages if page.extract_text()]
        )
        cursor.execute(
            "INSERT INTO documents (name, content) VALUES (?, ?)",
            (os.path.basename(file_path), pdf_text),
        )
        print(f"[+] Inserted PDF text from {file_path} into documents")

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        cursor.execute(
            "INSERT INTO documents (name, content) VALUES (?, ?)",
            (os.path.basename(file_path), text),
        )
        print(f"[+] Inserted TXT text from {file_path} into documents")

    else:
        print(f"[!] Skipping unsupported file type: {ext}")

    conn.commit()
    conn.close()


# ---- Usage ----
init_db("docs.db")

insert_file("D:\\Competitions\\SENTRY\\backend\\users_login_data.csv", "docs.db")
# insert_file("internal_policies.pdf", "docs.db")
# insert_file("salary_data.csv", "docs.db")
