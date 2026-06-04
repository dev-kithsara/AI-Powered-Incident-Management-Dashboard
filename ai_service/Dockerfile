FROM python:3.11-slim

WORKDIR /app

# Build tools needed for some packages
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install PyTorch CPU-only first (much smaller ~180MB vs 530MB GPU build)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the packages
RUN pip install --no-cache-dir --retries 5 --timeout 300 -r requirements.txt

# Pre-download sentence transformer model into image layer (cached)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
