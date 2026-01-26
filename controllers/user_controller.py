from fastapi import Request
from fastapi.responses import JSONResponse
from models.user_model import UserModel
from models.schemas import SingupRequest, LoginRequest


class UserController:
    @staticmethod
    async def signup(request: Request, data: SingupRequest):
        try:
            name = data.name
            email = data.email.lower()
            password = data.password

            result = UserModel.create_user(name, email, password)

            if not result:
                return JSONResponse(
                    status_code=400,
                    content={"error": True, "message": "註冊失敗，重複的電子信箱"},
                )

            return JSONResponse(status_code=200, content={"ok": True})
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def login(request: Request, data: LoginRequest):
        try:
            email = data.email.lower()
            password = data.password

            token, error = UserModel.verify_user(email, password)

            if error == "email":
                return JSONResponse(
                    status_code=400,
                    content={"error": True, "message": "登入失敗，錯誤的電子信箱"},
                )

            if error == "password":
                return JSONResponse(
                    status_code=400,
                    content={"error": True, "message": "登入失敗，密碼錯誤"},
                )

            return JSONResponse(status_code=200, content={"token": token})
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def authorization(request: Request):
        try:
            auth_header = request.headers.get("Authorization")

            # 確認是否登入
            if not auth_header:
                return JSONResponse(status_code=401, content={"data": None})

            # 取得登入資料
            try:
                token = auth_header.split(" ")[1]
                user_data = UserModel.decode_token(token) #type: ignore

                return JSONResponse(
                    status_code=200,
                    content={"data": user_data},
                )

            except Exception as e:
                return JSONResponse(
                    status_code=401, content={"error": True, "message": str(e)}
                )

        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )
