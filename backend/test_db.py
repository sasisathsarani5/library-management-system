import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

print("Attempting connection with:")
print(f"Host: {os.getenv('DB_HOST')}")
print(f"User: {os.getenv('DB_USER')}")
print(f"Password Length: {len(os.getenv('DB_PASSWORD', ''))}")
print(f"Database: {os.getenv('DB_NAME')}")

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'library_db')
    )
    print("SUCCESS: Connected to MySQL database successfully!")
    conn.close()
except Exception as e:
    print("\nERROR DETAILS:")
    print(e)