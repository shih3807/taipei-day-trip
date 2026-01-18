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
import requests

app = FastAPI()

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


def add_images(information, cursor):
    if information:
        try:
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
        except Exception as e:
            return print(f"新增圖片錯誤：{str(e)}")


@app.get("/api/attractions")
async def attractions(
    request: Request,
    page: int = 0,
    category: str | None = None,
    keyword: str | None = None,
):
    cnx = get_db()
    cursor = cnx.cursor()

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
            data = add_images(information, cursor)

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
            data = add_images(information, cursor)

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
            data = add_images(information, cursor)

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
            data = add_images(information, cursor)

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

    finally:
        cursor.close()
        cnx.close()


@app.get("/api/attraction/{attractionID}")
async def attraction_id(request: Request, attractionID: int):
    cnx = get_db()
    cursor = cnx.cursor()
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

    finally:
        cursor.close()
        cnx.close()


@app.get("/api/categories")
async def categories(request: Request):
    cnx = get_db()
    cursor = cnx.cursor()
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
    finally:
        cursor.close()
        cnx.close()


@app.get("/api/mrts")
async def mrts(request: Request):
    cnx = get_db()
    cursor = cnx.cursor()
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

    finally:
        cursor.close()
        cnx.close()


class SingupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/api/user")
async def singup(request: Request, data: SingupRequest):
    cnx = get_db()
    cursor = cnx.cursor()

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

        return JSONResponse(status_code=200, content={"ok": True})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
    finally:
        cursor.close()
        cnx.close()


class LoginRequest(BaseModel):
    email: str
    password: str


@app.put("/api/user/auth")
async def login(request: Request, data: LoginRequest):
    cnx = get_db()
    cursor = cnx.cursor()
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
    finally:
        cursor.close()
        cnx.close()


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


@app.get("/api/booking")
async def get_booking(request: Request):
    cnx = get_db()
    cursor = cnx.cursor(dictionary=True)
    try:
        auth_header = request.headers.get("Authorization")

        # 確認是否登入
        try:
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"error": True, "message": "未登入系統，拒絕存取"},
                )

            # 取得user_id
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")
            user_id = payload["id"]

        except Exception as e:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"},
            )

        # 取得booking資料
        cursor.execute(
            "SELECT "
            "attractions.id AS attraction_id,"
            "attractions.name AS attraction_name,"
            "attractions.address AS attraction_address,"
            "attraction_images.url AS image_url,"
            "booking.date AS date,"
            "booking.time AS time,"
            "booking.price AS price "
            "FROM booking "
            "INNER JOIN attractions ON booking.attraction_id= attractions.id "
            "INNER JOIN attraction_images ON attractions.id = attraction_images.attraction_id "
            "WHERE booking.user_id = %s "
            "LIMIT 1;",
            (user_id,),
        )
        data = cursor.fetchone()
        if not data:
            return JSONResponse(
                status_code=200,
                content={"data":None},
            )

        attraction_id = data["attraction_id"]
        attraction_name = data["attraction_name"]
        attraction_address = data["attraction_address"]
        attraction_image = data["image_url"]
        date = str(data["date"])
        time = data["time"]
        price = data["price"]

        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "attraction": {
                        "id": attraction_id,
                        "name": attraction_name,
                        "address": attraction_address,
                        "image": attraction_image,
                    },
                    "date": date,
                    "time": time,
                    "price": price,
                }
            },
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
    finally:
        cursor.close()
        cnx.close()


class postBookingRequest(BaseModel):
    attractionId: int
    date: str
    time: str
    price: int


@app.post("/api/booking")
async def post_booking(request: Request, data: postBookingRequest):
    cnx = get_db()
    cursor = cnx.cursor(dictionary=True)
    try:
        auth_header = request.headers.get("Authorization")

        # 確認是否登入
        try:
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"error": True, "message": "未登入系統，拒絕存取"},
                )

            # 取得user_id
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")
            user_id = payload["id"]

        except Exception as e:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"},
            )

        # 輸入booking資料
        try:
            attraction_id = data.attractionId
            date = data.date
            time = data.time
            price = data.price

            cursor.execute(
                "INSERT INTO "
                "booking(user_id, attraction_id, date, time, price) "
                "VALUES (%s, %s, %s, %s, %s) "
                "ON DUPLICATE KEY UPDATE attraction_id = VALUES(attraction_id),"
                "date = VALUES(date),"
                "time = VALUES(time),"
                "price = VALUES(price);",
                (user_id, attraction_id, date, time, price),
            )

            return JSONResponse(
                status_code=200,
                content={"ok": True},
            )

        except Exception as e:
            return JSONResponse(status_code=400, content={"error": True, "message": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
    finally:
        cursor.close()
        cnx.close()


@app.delete("/api/booking")
async def delete_booking(request: Request):
    cnx = get_db()
    cursor = cnx.cursor(dictionary=True)
    try:
        auth_header = request.headers.get("Authorization")

        # 確認是否登入
        try:
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"error": True, "message": "未登入系統，拒絕存取"},
                )

            # 取得user_id
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")
            user_id = payload["id"]

        except Exception as e:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"},
            )

        # 刪除booking資料
        cursor.execute(
            "DELETE FROM booking " 
            "WHERE user_id = %s;",
            (user_id,),
        )

        return JSONResponse(
            status_code=200,
            content={"ok": True},
        )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
    finally:
        cursor.close()
        cnx.close()


class AttractionModel(BaseModel):
    id: int
    name: str
    address: str
    image: str


class TripModel(BaseModel):
    attraction: AttractionModel
    date: str
    time: str


class ContactModel(BaseModel):
    name: str
    email: str
    phone: str


class OrderModel(BaseModel):
    price: int
    trip: TripModel
    contact: ContactModel


class OrderRequest(BaseModel):
    prime: str
    order: OrderModel


@app.post("/api/orders")
async def create_order(request: Request, data: OrderRequest):
    cnx = get_db()
    cursor = cnx.cursor(dictionary=True)
    try:
        auth_header = request.headers.get("Authorization")

        # 確認是否登入
        try:
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"error": True, "message": "未登入系統，拒絕存取"},
                )

            # 取得user_id
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")
            user_id = payload["id"]

        except Exception as e:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"},
            )

        try:
            # 產生訂單編號（userId + timestamp）
            order_number = f"{user_id}{int(datetime.datetime.now().timestamp())}"

            # 建立 UNPAID 訂單
            cursor.execute(
                """
                INSERT INTO orders
                (order_number, user_id, attraction_id, price, date, time,
                contact_name, contact_email, contact_phone, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'UNPAID')
                """,
                (
                    order_number,
                    user_id,
                    data.order.trip.attraction.id,
                    data.order.price,
                    data.order.trip.date,
                    data.order.trip.time,
                    data.order.contact.name,
                    data.order.contact.email,
                    data.order.contact.phone,
                ),
            )

            order_id = cursor.lastrowid
        except Exception as e:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "訂單建立失敗"},
            )

        # TapPay API
        tappay_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

        tappay_payload = {
            "prime": data.prime,
            "partner_key": os.environ.get("partner_key"),
            "merchant_id": os.environ.get("merchant_id"),
            "amount": data.order.price,
            "details": order_number,
            "cardholder": {
                "phone_number": data.order.contact.phone,
                "name": data.order.contact.name,
                "email": data.order.contact.email,
            },
        }

        headers = {"Content-Type": "application/json", "x-api-key": os.environ.get("partner_key")}

        tappay_res = requests.post(tappay_url, json=tappay_payload, headers=headers)
        tappay_result = tappay_res.json()

        #  payments 紀錄
        cursor.execute(
            """
            INSERT INTO payments
            (order_id, status, message, transaction_id, amount, raw_response)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                order_id,
                tappay_result.get("status"),
                tappay_result.get("msg"),
                tappay_result.get("rec_trade_id"),
                data.order.price,
                json.dumps(tappay_result),
            ),
        )

        # 付款成功
        if tappay_result.get("status") == 0:
            cursor.execute(
                "UPDATE orders SET status = 'PAID' WHERE id = %s", (order_id,)
            )
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_number,
                        "payment": {"status": 0, "message": "付款成功"},
                    }
                },
            )

        # 付款失敗
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "number": order_number,
                    "payment": {
                        "status": tappay_result.get("status"),
                        "message": tappay_result.get("msg"),
                    },
                }
            },
        )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

    finally:
        cursor.close()
        cnx.close()


@app.get("/api/order/{orderNumber}")
async def order_id(request: Request, orderNumber: int):
    cnx = get_db()
    cursor = cnx.cursor(dictionary=True)
    try:
        # 確認是否登入
        auth_header = request.headers.get("Authorization")
        try:
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"error": True, "message": "未登入系統，拒絕存取"},
                )

            # 取得user_id
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, secert, algorithms="HS256")
            user_id = payload["id"]

        except Exception as e:
            return JSONResponse(
                status_code=403,
                content={"error": True, "message": "未登入系統，拒絕存取"},
            )

        if orderNumber:
            cursor.execute(
                "SELECT "
                "orders.order_number AS order_number,"
                "orders.price AS price,"
                "attractions.id AS attraction_id,"
                "attractions.name AS attraction_name,"
                "attractions.address AS attraction_address,"
                "attraction_images.url AS image_url,"
                "orders.date AS date,"
                "orders.time AS time,"
                "orders.contact_name AS contact_name,"
                "orders.contact_email AS contact_email,"
                "orders.contact_phone AS contact_phone "
                "FROM orders "
                "INNER JOIN attractions ON orders.attraction_id = attractions.id "
                "INNER JOIN attraction_images ON attractions.id = attraction_images.attraction_id "
                "WHERE orders.order_number = %s "
                "LIMIT 1;",
                (orderNumber,),
            )
            data = cursor.fetchone()

            if not data:
                return JSONResponse(
                    status_code=200,
                    content={"data":None},
                )

            result = {
                "data": {
                    "number": data["order_number"],
                    "price": data["price"],
                    "trip": {
                        "attraction": {
                            "id": data["attraction_id"],
                            "name": data["attraction_name"],
                            "address": data["attraction_address"],
                            "image": data["image_url"],
                        },
                        "date": str(data["date"]),
                        "time": data["time"],
                    },
                    "contact": {
                        "name": data["contact_name"],
                        "email": data["contact_email"],
                        "phone": data["contact_phone"],
                    },
                    "status": 1,
                }
            }

            return JSONResponse(
                status_code=200,
                content=result,
            )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

    finally:
        cursor.close()
        cnx.close()
