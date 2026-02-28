# Bắt Đầu

TL;DR: Clone repo, cài đặt dependencies, khởi động Docker services, chạy migrations, sau đó chạy dev server với `pnpm dev`.

## Yêu Cầu

- **Docker** & Docker Compose - cho PostgreSQL và Garage (S3 storage)
- **pnpm** - package manager
- **Node.js** 20+ - runtime

## Cài Đặt

### 1. Clone repository

```bash
git clone https://github.com/your-org/giapha-os-clone.git
cd giapha-os-clone
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Cài đặt môi trường

Copy file env mẫu và cấu hình:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với cài đặt của bạn. Giá trị mặc định hoạt động cho local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/giapha"
GARAGE_ACCESS_KEY="garage_access_key"
GARAGE_SECRET_KEY="garage_secret_key"
GARAGE_ENDPOINT="http://localhost:3900"
GARAGE_BUCKET="giapha"
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Khởi động infrastructure

```bash
docker compose up -d
```

Điều này khởi động:
- **PostgreSQL** trên port 5432
- **Garage** (S3-compatible storage) trên port 3900

### 5. Thiết lập database

Đẩy schema vào database:

```bash
pnpm prisma db push
```

Tạo Prisma client:

```bash
pnpm prisma generate
```

(Tùy chọn) Seed dữ liệu mẫu:

```bash
pnpm prisma db seed
```

### 6. Khởi động development server

```bash
pnpm dev
```

App sẽ khả dụng tại `http://localhost:3000`.

## Các Lệnh Thường Dùng

| Lệnh | Mô tả |
|---------|-------------|
| `pnpm dev` | Khởi động development server |
| `pnpm build` | Build cho production |
| `pnpm prisma studio` | Mở database GUI |
| `pnpm prisma db push` | Đẩy thay đổi schema |
| `docker compose up -d` | Khởi động/dừng infrastructure |

## Khắc Phục Sự Cố

### Port đã được sử dụng

Nếu port 3000 đang được dùng:

```bash
# Tìm xem cái gì đang dùng nó
lsof -i :3000

# Hoặc dùng port khác
PORT=3001 pnpm dev
```

### Kết nối database bị từ chối

Đảm bảo Docker đang chạy:

```bash
docker ps
# Nên hiển thị postgres và garage containers
```

### Reset database

```bash
# Xóa và tạo lại
pnpm prisma migrate reset

# Hoặc chỉ push lại
pnpm prisma db push --force-reset
```

## Bước Tiếp Theo

- Đọc hướng dẫn [Architecture](./architecture.md) để hiểu cấu trúc project
- Đọc hướng dẫn [Development](./development.md) để bắt đầu xây dựng tính năng
- Khám phá tài liệu [Features](./features.md)
