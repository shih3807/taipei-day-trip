import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

cnxpool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    host=os.environ.get("DB_HOST"),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_NAME"),
    autocommit=True,
)


def get_db():
    return cnxpool.get_connection()
