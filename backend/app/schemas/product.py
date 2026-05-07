from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    image: str | None = None
    category: str | None = None
    brand: str | None = None
    rating: float = 0.0
    stock: int = 0


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    count: int
    next: str | None = None
    previous: str | None = None
    results: list[ProductResponse]


class SuggestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str | None = None
    price: Decimal
