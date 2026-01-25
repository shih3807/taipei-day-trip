from fastapi import *
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from controllers.attraction_controller import *
from controllers.user_controller import *
from controllers.booking_controller import *
from controllers.order_controller import *
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

load_dotenv()

app.mount("/static", StaticFiles(directory="static"), name="static")


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/templates/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/templates/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/templates/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/templates/thankyou.html", media_type="text/html")


# Attraction Routes
@app.get("/api/attractions")
async def attractions(
    request: Request,
    page: int = 0,
    category: str | None = None,
    keyword: str | None = None,
):
    return await AttractionController.get_attractions(request, page, category, keyword)


@app.get("/api/attraction/{attractionID}")
async def attraction_id(request: Request, attractionID: int):
    return await AttractionController.get_attraction_by_id(request, attractionID)


@app.get("/api/categories")
async def categories(request: Request):
    return await AttractionController.get_categories(request)


@app.get("/api/mrts")
async def mrts(request: Request):
    return await AttractionController.get_mrts(request)


# User Routes
@app.post("/api/user")
async def singup(request: Request, data: SingupRequest):
    return await UserController.signup(request, data)


@app.put("/api/user/auth")
async def login(request: Request, data: LoginRequest):
    return await UserController.login(request, data)


@app.get("/api/user/auth")
async def authorization(request: Request):
    return await UserController.authorization(request)


# Booking Routes
@app.get("/api/booking")
async def get_booking(request: Request):
    return await BookingController.get_booking(request)


@app.post("/api/booking")
async def post_booking(request: Request, data: postBookingRequest):
    return await BookingController.post_booking(request, data)


@app.delete("/api/booking")
async def delete_booking(request: Request):
    return await BookingController.delete_booking(request)


# Order Routes
@app.post("/api/orders")
async def create_order(request: Request, data: OrderRequest):
    return await OrderController.create_order(request, data)


@app.get("/api/order/{orderNumber}")
async def order_id(request: Request, orderNumber: int):
    return await OrderController.get_order_by_number(request, orderNumber)
