FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies
# - python3 & dev headers for DeepFace / native packages
# - libgl1 & libglib2.0-0 for OpenCV
# - libgomp1 for TensorFlow OpenMP parallel computing
# - curl for container healthcheck
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    ca-certificates \
    curl \
    dumb-init \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
  && rm -rf /var/lib/apt/lists/*

# Create an isolated Python environment (PEP 668 compatible).
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Set DeepFace cache path
ENV DEEPFACE_HOME=/root/.deepface

# Python deps (DeepFace stack)
COPY apps/api/requirements.txt /app/apps/api/requirements.txt
RUN pip install --no-cache-dir -U pip \
  && pip install --no-cache-dir -U setuptools wheel \
  && pip install --no-cache-dir -r /app/apps/api/requirements.txt

# Web deps (include package-lock for reproducible installs)
COPY apps/web/package.json apps/web/package-lock.json* /app/apps/web/
RUN cd /app/apps/web && npm install

# App source
COPY apps /app/apps
COPY specs /app/specs
COPY README.md /app/README.md

# Build Next.js production bundle
RUN cd /app/apps/web && npm run build

COPY docker/start.sh /app/docker/start.sh
RUN chmod +x /app/docker/start.sh

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD curl -f http://127.0.0.1:3000 || exit 1

CMD ["dumb-init", "--", "/app/docker/start.sh"]
