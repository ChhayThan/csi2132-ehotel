FROM postgres:17

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy your backend folder into the image so the script can access the Python and SQL files
COPY . /app/backend

# Copy the initialization shell script to the special entrypoint directory
COPY ./init-db.sh /docker-entrypoint-initdb.d/01_init-db.sh

# Ensure it is executable
RUN chmod +x /docker-entrypoint-initdb.d/01_init-db.sh
