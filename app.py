from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import json
import re
from dotenv import load_dotenv
import os
import mysql.connector
import math
import datetime
from pydantic import BaseModel
import bcrypt
import jwt

app = FastAPI()

load_dotenv()

taipei_day_trip = mysql.connector.connect(
    host=os.environ.get("DB_HOST"),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_NAME"),
)

cursor = taipei_day_trip.cursor()

app.mount("/static", StaticFiles(directory="static"), name="static")

secert = os.environ.get("TOKEN_SECRET")


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


def add_images(information):
    if information:
        data = []
        for row in information:
            id, name, CAT, description, address, transport, mrt, lat, lng = row

            cursor.execute(
                "SELECT url FROM attraction_images WHERE attraction_id = %s", (id,)
            )
            urls = cursor.fetchall()
            images = []
            for url in urls:
                images.append(url[0])  # type: ignore

            result = {
                "id": id,
                "name": name,
                "category": CAT,
                "description": description,
                "address": address,
                "transport": transport,
                "mrt": mrt,
                "lat": lat,
                "lng": lng,
                "images": images,
            }
            data.append(result)
        return data


@app.get("/api/attractions")
async def attractions(
    request: Request,
    page: int = 0,
    category: str | None = None,
    keyword: str | None = None,
):
    try:
        # category AND keyword
        first_page = 0
        page_limit = 8
        previous_page = page * 8

        if category and keyword:

            keyword_like = f"%{keyword}%"
            cursor.execute(
                "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                "FROM attractions "
                "WHERE CAT = %s AND (name LIKE %s OR MRT = %s) "
                "LIMIT %s OFFSET %s",
                (category, keyword_like, keyword, page_limit, previous_page),
            )
            information = cursor.fetchall()
            data = add_images(information)

            if not data:
                return JSONResponse(
                    status_code=200, content={"message": "沒有符合搜索的結果"}
                )

            # Next Page
            cursor.execute(
                "SELECT COUNT(*) "
                "FROM attractions "
                "WHERE CAT = %s AND (name LIKE %s OR MRT = %s) ",
                (category, keyword_like, keyword),
            )
            total_information = cursor.fetchall()[0][0]  # type: ignore
            total_pages = math.ceil(total_information / page_limit)  # type: ignore
            last_page = first_page + (total_pages - 1)
            next_page = page + 1
            nextPage = next_page if next_page <= last_page else None

            return JSONResponse(
                status_code=200,
                content={"nextPage": nextPage, "data": data},
            )

        elif category:
            cursor.execute(
                "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                "FROM attractions "
                "WHERE CAT = %s "
                "LIMIT %s OFFSET %s",
                (category, page_limit, previous_page),
            )
            information = cursor.fetchall()
            data = add_images(information)

            if not data:
                return JSONResponse(
                    status_code=200, content={"message": "沒有符合搜索的結果"}
                )

            # Next Page
            cursor.execute(
                "SELECT COUNT(*) FROM attractions WHERE CAT = %s ",
                (category,),
            )
            total_information = cursor.fetchall()[0][0]  # type: ignore
            total_pages = math.ceil(total_information / page_limit)  # type: ignore
            last_page = first_page + (total_pages - 1)
            next_page = page + 1
            nextPage = next_page if next_page <= last_page else None

            return JSONResponse(
                status_code=200,
                content={"nextPage": nextPage, "data": data},
            )

        elif keyword:
            keyword_like = f"%{keyword}%"
            cursor.execute(
                "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                "FROM attractions "
                "WHERE name LIKE %s OR MRT = %s "
                "LIMIT %s OFFSET %s",
                (keyword_like, keyword, page_limit, previous_page),
            )
            information = cursor.fetchall()
            data = add_images(information)

            if not data:
                return JSONResponse(
                    status_code=200, content={"message": "沒有符合搜索的結果"}
                )

            # Next Page
            cursor.execute(
                "SELECT COUNT(*) FROM attractions WHERE name LIKE %s OR MRT = %s ",
                (keyword_like, keyword),
            )
            total_information = cursor.fetchall()[0][0]  # type: ignore
            total_pages = math.ceil(total_information / page_limit)  # type: ignore
            last_page = first_page + (total_pages - 1)
            next_page = page + 1
            nextPage = next_page if next_page <= last_page else None

            return JSONResponse(
                status_code=200,
                content={"nextPage": nextPage, "data": data},
            )

        else:
            cursor.execute(
                "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                "FROM attractions "
                "LIMIT %s OFFSET %s",
                (page_limit, previous_page),
            )
            information = cursor.fetchall()
            data = add_images(information)

            if not data:
                return JSONResponse(
                    status_code=200, content={"message": "沒有符合搜索的結果"}
                )

            # Next Page
            cursor.execute("SELECT COUNT(*) FROM attractions")
            total_information = cursor.fetchall()[0][0]  # type: ignore
            total_pages = math.ceil(total_information / page_limit)  # type: ignore
            last_page = first_page + (total_pages - 1)
            next_page = page + 1
            nextPage = next_page if next_page <= last_page else None

            return JSONResponse(
                status_code=200, content={"nextPage": nextPage, "data": data}
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


@app.get("/api/attraction/{attractionID}")
async def attraction_id(request: Request, attractionID: int):
    try:
        if attractionID:
            cursor.execute(
                "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude FROM attractions WHERE id = %s",
                (attractionID,),
            )
            information = cursor.fetchall()
            id, name, CAT, description, address, transport, mrt, lat, lng = information[
                0
            ]

            cursor.execute(
                "SELECT url FROM attraction_images WHERE attraction_id = %s", (id,)  # type: ignore
            )

            urls = cursor.fetchall()
            images = []
            for url in urls:
                images.append(url[0])  # type: ignore

            data = {
                "id": id,
                "name": name,
                "category": CAT,
                "description": description,
                "address": address,
                "transport": transport,
                "mrt": mrt,
                "lat": lat,
                "lng": lng,
                "images": images,
            }

            if not data:
                return JSONResponse(
                    status_code=400,
                    content={"error": True, "message": "沒有符合搜索的結果"},
                )

            return JSONResponse(
                status_code=200,
                content={"data": data},
            )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


@app.get("/api/categories")
async def categories(request: Request):
    try:
        cursor.execute("SELECT DISTINCT CAT FROM attractions ORDER BY CAT DESC")
        CAT = cursor.fetchall()
        data = []
        for row in CAT:
            data.append(str(row[0]))  # type: ignore

        return JSONResponse(
            status_code=200,
            content={"data": data},
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


@app.get("/api/mrts")
async def mrts(request: Request):
    try:
        cursor.execute(
            "SELECT MRT, COUNT(*) AS number_of_attractions "
            "FROM attractions "
            "WHERE MRT IS NOT Null "
            "GROUP BY MRT "
            "ORDER BY number_of_attractions DESC"
        )

        MRT = cursor.fetchall()
        data = []
        for row in MRT:
            data.append(str(row[0]))  # type: ignore

        return JSONResponse(
            status_code=200,
            content={"data": data},
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


class SingupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/api/user")
async def singup(request: Request, data: SingupRequest):
    try:
        name = data.name
        email = data.email.lower()
        password = data.password

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()

        if result:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "註冊失敗，重複的電子信箱"},
            )

        salt = bcrypt.gensalt()
        hash_password = bcrypt.hashpw(password.encode("utf-8"), salt)
        print(hash_password)

        cursor.execute(
            "INSERT INTO users(name, email, password) VALUES(%s, %s, %s)",
            (name, email, hash_password.decode("utf-8")),
        )
        taipei_day_trip.commit()

        return JSONResponse(status_code=200, content={"ok": True})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


class LoginRequest(BaseModel):
    email: str
    password: str


@app.put("/api/user/auth")
async def login(request: Request, data: LoginRequest):
    try:
        email = data.email.lower()
        password = data.password

        # check if email exists
        cursor.execute(
            "SELECT id, name, email, password FROM users WHERE email = %s", (email,)
        )
        user = cursor.fetchone()
        if not user:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "登入失敗，錯誤的電子信箱"},
            )

        # check if password is correct
        user_id = int(user[0])  # type: ignore
        user_name = str(user[1])  # type: ignore
        user_email = str(user[2])  # type: ignore
        user_password = str(user[3])  # type: ignore

        if not bcrypt.checkpw(password.encode("utf-8"), user_password.encode("utf-8")):
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "登入失敗，密碼錯誤"},
            )

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
        return JSONResponse(status_code=200, content={"token": token})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})


@app.get("/api/user/auth")
async def authorization(request: Request):
    try:
        auth_header = request.headers.get("Authorization")

        # 確認是否登入
        if not auth_header:
            return JSONResponse(status_code=401, content={"data": None})

        # 取得登入資料
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")

            user_id = payload["id"]
            user_name = payload["name"]
            user_email = payload["email"]

            return JSONResponse(
                status_code=200,
                content={
                    "data": {"id": user_id, "name": user_name, "email": user_email}
                },
            )

        except Exception as e:
            return JSONResponse(
                status_code=401, content={"error": True, "message": str(e)}
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
