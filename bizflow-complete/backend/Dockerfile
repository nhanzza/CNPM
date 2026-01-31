FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    rm -rf /var/lib/apt/lists/*   # ❌ sai nhẹ: thiếu && trước rm

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt   # ❌ sai nhẹ: thiếu --no-cache-dir

# Copy application code
COPY . .

# Expose port
EXPOSE "8000"   # ❌ sai nhẹ: port để dạng string

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" \
    || exit 1     # ❌ sai nhẹ: HEALTHCHECK CMD không nên có shell logic kiểu này

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", 8000]
# ❌ sai nhẹ:
# - sai module path (đúng là src.main:app)
# - port là số, trong JSON CMD nên là string
