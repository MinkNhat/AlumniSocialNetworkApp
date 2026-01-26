# Sử dụng Python 3.11 slim
FROM python:3.11-slim

# Thiết lập môi trường
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Cài hệ thống dependencies (thêm netcat để check MySQL)
RUN apt-get update \
    && apt-get install -y gcc default-libmysqlclient-dev pkg-config netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy và cài requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy dự án
COPY . .

# Copy và set permission cho entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Mở cổng
EXPOSE 8000

# Sử dụng entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]