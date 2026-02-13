# ---------------------------------------------------
# Base image
# ---------------------------------------------------
FROM node:22-slim

# ---------------------------------------------------
# Install OS deps for Oracle
# ---------------------------------------------------
RUN apt-get update && apt-get install -y \
    libaio1 \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------
# Oracle Instant Client (Linux)
# ---------------------------------------------------
WORKDIR /opt/oracle

RUN wget https://download.oracle.com/otn_software/linux/instantclient/2121000/instantclient-basiclite-linux.x64-21.21.0.0.0dbru.zip \
    && unzip instantclient-basiclite-linux.x64-21.21.0.0.0dbru.zip \
    && rm instantclient-basiclite-linux.x64-21.21.0.0.0dbru.zip

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_21
ENV PATH=$PATH:/opt/oracle/instantclient_21_21

# ---------------------------------------------------
# Create app user FIRST
# ---------------------------------------------------
RUN useradd -m appuser

# ---------------------------------------------------
# Oracle Wallet
# ---------------------------------------------------
COPY Wallet_MYFREEDB /opt/oracle/wallet
ENV TNS_ADMIN=/opt/oracle/wallet
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_21

RUN chown -R appuser:appuser /opt/oracle/wallet \
    && chmod 755 /opt/oracle/wallet \
    && chmod 644 /opt/oracle/wallet/*

# ---------------------------------------------------
# App
# ---------------------------------------------------
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

USER appuser

EXPOSE 10000
CMD ["node", "server.js"]
