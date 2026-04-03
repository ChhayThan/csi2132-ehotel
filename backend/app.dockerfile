# Use a slim Python image for a smaller footprint
FROM python:3.11-slim

# Set environment variables
# Prevents Python from writing .pyc files and ensures output is sent to logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies needed for Postgres and building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
# This ensures pip install only runs when requirements.txt changes
COPY ./requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

# Copy the rest of the backend source code
COPY ./app .

# Expose the port FastAPI runs on
EXPOSE 8000

# The command is handled by docker-compose.yml, 
# but we provide a default here just in case.
CMD ["fastapi", "run", "api.py", "--port", "8000"]
