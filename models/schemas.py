from pydantic import BaseModel


class SingupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class postBookingRequest(BaseModel):
    attractionId: int
    date: str
    time: str
    price: int


class AttractionModel(BaseModel):
    id: int
    name: str
    address: str
    image: str


class TripModel(BaseModel):
    attraction: AttractionModel
    date: str
    time: str


class ContactModel(BaseModel):
    name: str
    email: str
    phone: str


class OrderModel(BaseModel):
    price: int
    trip: TripModel
    contact: ContactModel


class OrderRequest(BaseModel):
    prime: str
    order: OrderModel
