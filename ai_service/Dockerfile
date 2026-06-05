FROM python:3.11-slim AS builder

WORKDIR /build

# Build tools needed for some packages
RUN apt-get update \
  && apt-get install -y build-essential \
  && rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV HF_HOME=/opt/hf
ENV SENTENCE_TRANSFORMERS_HOME=/opt/sentence-transformers

RUN python -m venv "$VIRTUAL_ENV"

COPY requirements.txt .

# Install PyTorch CPU-only first (much smaller ~180MB vs 530MB GPU build)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the packages
RUN pip install --no-cache-dir --retries 5 --timeout 300 -r requirements.txt

# Pre-download sentence transformer model into the image layer (cached)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

FROM python:3.11-slim AS runtime

WORKDIR /app

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/opt/hf
ENV SENTENCE_TRANSFORMERS_HOME=/opt/sentence-transformers

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /opt/hf /opt/hf
COPY --from=builder /opt/sentence-transformers /opt/sentence-transformers
COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
