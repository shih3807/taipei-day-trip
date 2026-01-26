from models.database import get_db
import bcrypt
import jwt
import datetime
import os

secert = os.environ.get("TOKEN_SECRET")


class UserModel:
    @staticmethod
    def create_user(name, email, password):
        cnx = get_db()
        cursor = cnx.cursor()
        try:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            result = cursor.fetchone()

            if result:
                return None

            salt = bcrypt.gensalt()
            hash_password = bcrypt.hashpw(password.encode("utf-8"), salt)

            cursor.execute(
                "INSERT INTO users(name, email, password) VALUES(%s, %s, %s)",
                (name, email, hash_password.decode("utf-8")),
            )

            return True
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def verify_user(email, password):
        cnx = get_db()
        cursor = cnx.cursor()
        try:
            # check if email exists
            cursor.execute(
                "SELECT id, name, email, password FROM users WHERE email = %s", (email,)
            )
            user = cursor.fetchone()
            if not user:
                return None, "email"

            # check if password is correct
            user_id = int(user[0])  # type: ignore
            user_name = str(user[1])  # type: ignore
            user_email = str(user[2])  # type: ignore
            user_password = str(user[3])  # type: ignore

            if not bcrypt.checkpw(
                password.encode("utf-8"), user_password.encode("utf-8")
            ):
                return None, "password"

            # 製作 Token
            payload = {
                "id": user_id,
                "name": user_name,
                "email": user_email,
                "exp": datetime.datetime.now(datetime.timezone.utc)
                + datetime.timedelta(days=7),
            }
            token = jwt.encode(payload, secert, algorithm="HS256")
            print(token)
            return token, None
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def decode_token(token):
        try:
            payload = jwt.decode(token, secert, algorithms="HS256")

            user_id = payload["id"]
            user_name = payload["name"]
            user_email = payload["email"]

            return {"id": user_id, "name": user_name, "email": user_email}
        except Exception as e:
            raise e
