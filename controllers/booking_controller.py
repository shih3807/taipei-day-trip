from fastapi import Request
from fastapi.responses import JSONResponse
from models.booking_model import BookingModel
from models.user_model import UserModel
from models.schemas import postBookingRequest
import jwt
import os
from dotenv import load_dotenv

load_dotenv()


secert = os.environ.get("TOKEN_SECRET")


class BookingController:
    @staticmethod
    async def get_booking(request: Request):
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
            data = BookingModel.get_booking_by_user_id(user_id)

            if not data:
                return JSONResponse(
                    status_code=200,
                    content={"data": None},
                )

            return JSONResponse(
                status_code=200,
                content={"data": data},
            )
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def post_booking(request: Request, data: postBookingRequest):
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

                BookingModel.create_or_update_booking(
                    user_id, attraction_id, date, time, price
                )

                return JSONResponse(
                    status_code=200,
                    content={"ok": True},
                )

            except Exception as e:
                return JSONResponse(
                    status_code=400, content={"error": True, "message": str(e)}
                )
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def delete_booking(request: Request):
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
            BookingModel.delete_booking_by_user_id(user_id)

            return JSONResponse(
                status_code=200,
                content={"ok": True},
            )

        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )
