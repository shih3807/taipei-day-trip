from models.database import get_db
import math


class AttractionModel:
    @staticmethod
    def add_images(information, cursor):
        if information:
            try:
                data = []
                for row in information:
                    id, name, CAT, description, address, transport, mrt, lat, lng = row

                    cursor.execute(
                        "SELECT url FROM attraction_images WHERE attraction_id = %s",
                        (id,),
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

    @staticmethod
    def get_attractions(page, category, keyword):
        cnx = get_db()
        cursor = cnx.cursor()
        try:
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
                data = AttractionModel.add_images(information, cursor)

                if not data:
                    return None, None

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

                return data, nextPage

            elif category:
                cursor.execute(
                    "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                    "FROM attractions "
                    "WHERE CAT = %s "
                    "LIMIT %s OFFSET %s",
                    (category, page_limit, previous_page),
                )
                information = cursor.fetchall()
                data = AttractionModel.add_images(information, cursor)

                if not data:
                    return None, None

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

                return data, nextPage

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
                data = AttractionModel.add_images(information, cursor)

                if not data:
                    return None, None

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

                return data, nextPage

            else:
                cursor.execute(
                    "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude "
                    "FROM attractions "
                    "LIMIT %s OFFSET %s",
                    (page_limit, previous_page),
                )
                information = cursor.fetchall()
                data = AttractionModel.add_images(information, cursor)

                if not data:
                    return None, None

                # Next Page
                cursor.execute("SELECT COUNT(*) FROM attractions")
                total_information = cursor.fetchall()[0][0]  # type: ignore
                total_pages = math.ceil(total_information / page_limit)  # type: ignore
                last_page = first_page + (total_pages - 1)
                next_page = page + 1
                nextPage = next_page if next_page <= last_page else None

                return data, nextPage

        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def get_attraction_by_id(attractionID):
        cnx = get_db()
        cursor = cnx.cursor()
        try:
            if attractionID:
                cursor.execute(
                    "SELECT id,name, CAT, description, address, direction, MRT, latitude, longitude FROM attractions WHERE id = %s",
                    (attractionID,),
                )
                information = cursor.fetchall()
                id, name, CAT, description, address, transport, mrt, lat, lng = (
                    information[0]
                )

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

                return data
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def get_categories():
        cnx = get_db()
        cursor = cnx.cursor()
        try:
            cursor.execute("SELECT DISTINCT CAT FROM attractions ORDER BY CAT DESC")
            CAT = cursor.fetchall()
            data = []
            for row in CAT:
                data.append(str(row[0]))  # type: ignore

            return data
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()

    @staticmethod
    def get_mrts():
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

            return data
        except Exception as e:
            raise e
        finally:
            cursor.close()
            cnx.close()
