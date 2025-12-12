import json
import re
from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

taipei_day_trip = mysql.connector.connect(
    host="localhost",
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database="taipei_day_trip",
)

cursor = taipei_day_trip.cursor()

with open("data/taipei-attractions.json", "r", encoding="utf-8") as f:
    data = json.load(f)["result"]["results"]


def chang_string_to_date(string):
    date = string.replace("/", "-")
    return date


try:
    for attraction in data:
        name = attraction["name"] or None
        rate = int(attraction["rate"]) if attraction["rate"] else None
        direction = attraction["direction"] or None
        date = chang_string_to_date(attraction["date"]) if attraction["date"] else None
        longitude = float(attraction["longitude"]) if attraction["longitude"] else None
        latitude = float(attraction["latitude"]) if attraction["latitude"] else None
        REF_WP = attraction["REF_WP"] or None
        avBegin = chang_string_to_date(attraction["avBegin"]) if attraction["avBegin"] else None
        avEnd = chang_string_to_date(attraction["avEnd"]) if attraction["avEnd"] else None
        langinfo = attraction["langinfo"] or None
        MRT = attraction["MRT"] or None
        SERIAL_NO = attraction["SERIAL_NO"] or None
        RowNumber = int(attraction["RowNumber"]) if attraction["RowNumber"] else None
        CAT = attraction["CAT"] or None
        MEMO_TIME = attraction["MEMO_TIME"] or None
        POI = attraction["POI"] or None
        idpt = attraction["idpt"] or None
        description = attraction["description"] or None
        _id = attraction["_id"] or None
        address = attraction["address"] or None

        cursor.execute(
            "INSERT INTO attractions(name, rate, direction, date,longitude, latitude, REF_WP,  avBegin, avEnd, langinfo, MRT, SERIAL_NO, RowNumber,  CAT, MEMO_TIME, POI, idpt, description, _id, address)"
            " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (name, rate, direction, date,longitude, latitude, REF_WP,  avBegin, avEnd, langinfo, MRT, SERIAL_NO, RowNumber,  CAT, MEMO_TIME, POI, idpt, description, _id, address)
        )

        file = attraction["file"]
        pic = re.compile(r"https?://.+?\.(?:jpg|png|JPG|PNG)")
        files = pic.findall(file)

        attraction_id = cursor.lastrowid

        for url in files:
            cursor.execute("INSERT INTO attraction_images(attraction_id, url) VALUES (%s, %s)",(attraction_id,url))

    taipei_day_trip.commit()
except:
    taipei_day_trip.rollback()
    raise
