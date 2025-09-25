# Sử dụng Python 3.11 slim
FROM python:3.11-slim

# Thiết lập môi trường
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Cài hệ thống dependencies
RUN apt-get update \
    && apt-get install -y gcc default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy và cài requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy dự án
COPY . .

# Collect static files
RUN python socialnetworkapi/manage.py collectstatic --noinput

# Mở cổng
EXPOSE 8000

# Chạy Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "socialnetworkapi.asgi:application"]