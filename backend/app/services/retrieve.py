import sqlite3


def fetch_docs(db_path="docs.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Grab salary_data (structured) -> flatten row into string
    cursor.execute(
        "SELECT id, Name, UserID, Department, MonthlySalary, AccountNumber FROM salary_data"
    )
    salary_rows = cursor.fetchall()

    salary_docs = [
        (
            row[0],
            f"Employee {row[1]}, SSN {row[2]}, Dept {row[3]}, Salary {row[4]}, Acc {row[5]}",
        )
        for row in salary_rows
    ]

    # Grab unstructured docs
    cursor.execute("SELECT id, name, content FROM documents")
    doc_rows = cursor.fetchall()

    text_docs = [(row[0], row[2]) for row in doc_rows]

    conn.close()
    return text_docs
