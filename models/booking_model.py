from models.database import get_db


class BookingModel:
    @staticmethod
    def get_booking_by_user_id(user_id):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
        try:
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
                return None

            attraction_id = data["attraction_id"]
            attraction_name = data["attraction_name"]
            attraction_address = data["attraction_address"]
            attraction_image = data["image_url"]
            date = str(data["date"])
            time = data["time"]
            price = data["price"]

            return {
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
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def create_or_update_booking(user_id, attraction_id, date, time, price):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
        try:
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

            return True
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def delete_booking_by_user_id(user_id):
        cnx = get_db()
        cursor = cnx.cursor(dictionary=True)
        try:
            cursor.execute(
                "DELETE FROM booking " "WHERE user_id = %s;",
                (user_id,),
            )

            return True
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()
