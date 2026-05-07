# Interactive Product Catalog

A fullstack ecommerce catalog application with product browsing, filtering, search, cart management, and product comparison.

## Tech Stack

**Backend:** Python · FastAPI · PostgreSQL · SQLAlchemy 2.x async · Alembic · Pydantic v2 · Uvicorn  
**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · React Hooks · react-hot-toast  
**Infrastructure:** Docker · Docker Compose

## Features

- Product catalog with grid layout
- Full-text search with autocomplete suggestions
- Filtering by category, price range
- Sorting by price, name, rating
- Pagination
- Product detail pages
- Shopping cart (session-based, stored in PostgreSQL)
- Optimistic UI updates in cart
- Product comparison (up to 4 products)
- Toast notifications
- Responsive mobile-first design
- Loading skeletons & error states

## Project Structure

```
project-root/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # products.py, cart.py
│   │   ├── core/           # config.py, database.py
│   │   ├── models/         # product.py, cart.py
│   │   ├── schemas/        # product.py, cart.py
│   │   ├── services/       # product_service.py, cart_service.py
│   │   ├── seed.py         # 46 demo products
│   │   └── main.py
│   ├── alembic/            # migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── services/api.ts     # API client
│   ├── utils/              # session, helpers
│   ├── types/index.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

```bash
docker compose up --build
```

Then open:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection string |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Useful Commands

```bash
# Start all services
docker compose up --build

# Stop and remove volumes
docker compose down -v

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Run only backend
docker compose up backend postgres

# Rebuild a single service
docker compose up --build backend
```

## API Documentation

Full interactive API docs available at: **http://localhost:8000/docs**

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/` | List products (with filters) |
| GET | `/api/products/{id}/` | Product detail |
| GET | `/api/products/categories/` | List categories |
| GET | `/api/products/suggestions/` | Search autocomplete |
| GET | `/api/cart/?session_id=` | Get cart |
| POST | `/api/cart/` | Add item to cart |
| PUT | `/api/cart/{item_id}/` | Update item quantity |
| DELETE | `/api/cart/{item_id}/` | Remove item |
| DELETE | `/api/cart/clear/` | Clear cart |
| GET | `/health` | Health check |

## Database Migrations

Migrations run automatically on container startup via `alembic upgrade head`.

To run manually:
```bash
docker compose exec backend alembic upgrade head
```

## Seed Data

46 demo products across 6 categories are seeded automatically on first startup:
- **Electronics** (10): phones, laptops, cameras, headphones
- **Clothing** (8): jeans, shoes, jackets, t-shirts
- **Books** (8): programming, fiction, self-help
- **Home** (8): appliances, furniture, kitchen
- **Sport** (6): shoes, trackers, yoga, fitness
- **Beauty** (6): skincare, makeup, styling

## Session-based Cart

The cart is session-based (no authentication required):
- On first visit, a UUID `session_id` is generated and stored in `localStorage`
- All cart API requests include this `session_id`
- Cart data is persisted in PostgreSQL
- `localStorage` is only used for `session_id` and compare product IDs
