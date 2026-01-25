from fastapi import Request
from fastapi.responses import JSONResponse
from models.order_model import OrderModel
from models.schemas import OrderRequest
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

secert = os.environ.get("TOKEN_SECRET")


class OrderController:
    @staticmethod
    async def create_order(request: Request, data: OrderRequest):
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
                order_number, order_id = OrderModel.create_order(
                    user_id,
                    data.order.trip.attraction.id,
                    data.order.price,
                    data.order.trip.date,
                    data.order.trip.time,
                    data.order.contact.name,
                    data.order.contact.email,
                    data.order.contact.phone,
                )
            except Exception as e:
                return JSONResponse(
                    status_code=400,
                    content={"error": True, "message": "訂單建立失敗"},
                )

            tappay_result = OrderModel.process_payment(
                data.prime,
                order_number,
                data.order.price,
                data.order.contact.name,
                data.order.contact.email,
                data.order.contact.phone,
                order_id,
            )

            # 付款成功
            if tappay_result.get("status") == 0:
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
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def get_order_by_number(request: Request, orderNumber: int):
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
                result = OrderModel.get_order_by_number(orderNumber)

                if not result:
                    return JSONResponse(
                        status_code=200,
                        content={"data": None},
                    )

                return JSONResponse(
                    status_code=200,
                    content={"data": result},
                )
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )
