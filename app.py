from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import json
import re
from dotenv import load_dotenv
import os
import mysql.connector
import math


app=FastAPI()

load_dotenv()

taipei_day_trip = mysql.connector.connect(
    host=os.environ.get("DB_HOST"),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_NAME"),
)

cursor = taipei_day_trip.cursor()

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

@app.get("/api/attractions")
async def attractions(request:Request,page:int =0, category:str| None=None, keyword:str| None=None):
    try:
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
            last_page = first_page + (total_pages -1)
            next_page = page +1 
            nextPage = next_page if next_page < last_page else None

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
            nextPage = next_page if next_page < last_page else None

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
            nextPage = next_page if next_page < last_page else None

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
                print("{'message':'沒有符合搜索的結果'}")

            # Next Page
            cursor.execute("SELECT COUNT(*) FROM attractions")
            total_information = cursor.fetchall()[0][0]  # type: ignore
            total_pages = math.ceil(total_information / page_limit)  # type: ignore
            last_page = first_page + (total_pages - 1)
            next_page = page + 1
            nextPage = next_page if next_page < last_page else None

            return JSONResponse(
                status_code=200, content={"nextPage": nextPage, "data": data}
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": e})
