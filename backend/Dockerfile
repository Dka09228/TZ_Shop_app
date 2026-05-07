FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
# Install packages, then register /app via .pth so installed packages
# (like alembic) keep priority over any same-named local directories.
RUN pip install --no-cache-dir -r requirements.txt && \
    python -c "import site; open(site.getsitepackages()[0]+'/catalog.pth','w').write('/app\n')"

COPY . .

CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
