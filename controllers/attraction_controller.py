from fastapi import Request
from fastapi.responses import JSONResponse
from models.attraction_model import AttractionModel


class AttractionController:
    @staticmethod
    async def get_attractions(
        request: Request, page: int, category: str | None, keyword: str | None
    ):
        try:
            data, nextPage = AttractionModel.get_attractions(page, category, keyword)

            if not data:
                return JSONResponse(
                    status_code=200, content={"message": "沒有符合搜索的結果"}
                )

            return JSONResponse(
                status_code=200,
                content={"nextPage": nextPage, "data": data},
            )

        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def get_attraction_by_id(request: Request, attractionID: int):
        try:
            data = AttractionModel.get_attraction_by_id(attractionID)

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
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def get_categories(request: Request):
        try:
            data = AttractionModel.get_categories()

            return JSONResponse(
                status_code=200,
                content={"data": data},
            )
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )

    @staticmethod
    async def get_mrts(request: Request):
        try:
            data = AttractionModel.get_mrts()

            return JSONResponse(
                status_code=200,
                content={"data": data},
            )
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": True, "message": str(e)}
            )
