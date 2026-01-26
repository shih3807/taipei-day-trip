from models.database import get_db
import datetime
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()


class OrderModel:
    @staticmethod
    def create_order(
        user_id,
        attraction_id,
        price,
        date,
        time,
        contact_name,
        contact_email,
        contact_phone,
    ):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
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
                    attraction_id,
                    price,
                    date,
                    time,
                    contact_name,
                    contact_email,
                    contact_phone,
                ),
            )

            order_id = cursor.lastrowid
            return order_number, order_id
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def process_payment(
        prime, order_number, price, contact_name, contact_email, contact_phone, order_id
    ):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
        try:
            # TapPay API
            tappay_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

            tappay_payload = {
                "prime": prime,
                "partner_key": os.environ.get("partner_key"),
                "merchant_id": os.environ.get("merchant_id"),
                "amount": price,
                "details": order_number,
                "cardholder": {
                    "phone_number": contact_phone,
                    "name": contact_name,
                    "email": contact_email,
                },
            }

            headers = {
                "Content-Type": "application/json",
                "x-api-key": os.environ.get("partner_key"),
            }

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
                    price,
                    json.dumps(tappay_result),
                ),
            )

            # 付款成功
            if tappay_result.get("status") == 0:
                cursor.execute(
                    "UPDATE orders SET status = 'PAID' WHERE id = %s", (order_id,)
                )

            return tappay_result
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def get_order_by_number(orderNumber):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
        try:
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
                    return None

                result = {
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

                return result
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()
