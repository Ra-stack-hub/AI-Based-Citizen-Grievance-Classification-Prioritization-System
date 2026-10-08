FROM python:3.11-slim

WORKDIR /app

# Copy only requirements first for better caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY backend/ .

# Run the FastAPI app on port 7860 (Hugging Face default)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
