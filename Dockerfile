FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    ca-certificates \
    dumb-init \
    libglib2.0-0 \
    libgl1 \
  && rm -rf /var/lib/apt/lists/*

# Create an isolated Python environment (PEP 668 compatible).
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Python deps (DeepFace stack)
COPY apps/api/requirements.txt /app/apps/api/requirements.txt
RUN pip install --no-cache-dir -U pip \
  && pip install --no-cache-dir -U setuptools wheel \
  && pip install --no-cache-dir -r /app/apps/api/requirements.txt

# Web deps
COPY apps/web/package.json /app/apps/web/package.json
RUN cd /app/apps/web && npm install

# App source
COPY apps /app/apps
COPY specs /app/specs
COPY README.md /app/README.md

# Build Next.js
RUN cd /app/apps/web && npm run build

COPY docker/start.sh /app/docker/start.sh
RUN chmod +x /app/docker/start.sh

EXPOSE 3000
CMD ["dumb-init", "--", "/app/docker/start.sh"]
