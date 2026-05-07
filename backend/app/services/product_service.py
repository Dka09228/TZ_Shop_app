from decimal import Decimal
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductListResponse, SuggestionResponse


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_products(
        self,
        search: str | None = None,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        sort_by: str | None = None,
        sort_order: str = "asc",
        limit: int = 12,
        offset: int = 0,
    ) -> ProductListResponse:
        conditions = []

        if search:
            term = f"%{search}%"
            conditions.append(
                or_(
                    Product.name.ilike(term),
                    Product.description.ilike(term),
                )
            )
        if category:
            conditions.append(Product.category == category)
        if min_price is not None:
            conditions.append(Product.price >= Decimal(str(min_price)))
        if max_price is not None:
            conditions.append(Product.price <= Decimal(str(max_price)))

        where_clause = and_(*conditions) if conditions else None

        count_query = select(func.count()).select_from(Product)
        if where_clause is not None:
            count_query = count_query.where(where_clause)

        total = await self.db.scalar(count_query) or 0

        query = select(Product)
        if where_clause is not None:
            query = query.where(where_clause)

        if sort_by and hasattr(Product, sort_by):
            col = getattr(Product, sort_by)
            query = query.order_by(col.desc() if sort_order == "desc" else col.asc())

        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        products = list(result.scalars().all())

        next_url = f"/api/products/?limit={limit}&offset={offset + limit}" if offset + limit < total else None
        prev_url = f"/api/products/?limit={limit}&offset={max(0, offset - limit)}" if offset > 0 else None

        return ProductListResponse(
            count=total,
            next=next_url,
            previous=prev_url,
            results=products,
        )

    async def get_product(self, product_id: int) -> Product | None:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def get_categories(self) -> list[str]:
        result = await self.db.execute(
            select(Product.category)
            .distinct()
            .where(Product.category.isnot(None))
            .order_by(Product.category)
        )
        return [row[0] for row in result.fetchall()]

    async def get_suggestions(self, search: str, limit: int = 8) -> list[Product]:
        term = f"%{search}%"
        result = await self.db.execute(
            select(Product).where(Product.name.ilike(term)).limit(limit)
        )
        return list(result.scalars().all())
