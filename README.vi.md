# Gia Pha OS Clone

[English](README.md) | Tiếng Việt

Ứng dụng quản lý gia phả tự host. Đây là bản tái triển khai của [Gia Pha OS](https://github.com/homielab/giapha-os) sử dụng hoàn toàn hạ tầng tự host — không phụ thuộc dịch vụ đám mây bên thứ ba.

Đây là ứng dụng chủ yếu bằng tiếng Việt. Ứng dụng có hỗ trợ tiếng Anh, nhưng chỉ ở mức giao diện sử dụng. Các thuật ngữ xưng hô trong gia phả vẫn giữ nguyên tiếng Việt.

## Công Nghệ

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19, TypeScript)
- **Xác thực**: [Better Auth](https://www.better-auth.com/)
- **Cơ sở dữ liệu**: [Prisma](https://www.prisma.io/) + PostgreSQL
- **Lưu trữ tệp**: [Garage](https://garagehq.deuxfleurs.fr/) (tương thích S3)
- **Giao diện**: [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Kiểm thử**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Hạ tầng**: Docker Compose

## Tính Năng

- Hiển thị cây gia phả (dạng cây, sơ đồ tư duy, và danh sách)
- Quản lý thành viên với tải ảnh đại diện
- Tính toán mối quan hệ xưng hô trong gia phả
- Tích hợp lịch âm cho ngày giỗ
- Bảng thống kê gia đình
- Sự kiện sắp tới (sinh nhật và ngày giỗ)
- Xuất/nhập dữ liệu (sao lưu JSON)
- Phân quyền truy cập (quản trị viên/thành viên)
- Quản lý người dùng (duyệt, chặn, tạo tài khoản)

## Yêu Cầu

- [Node.js](https://nodejs.org/) v22.x
- [pnpm](https://pnpm.io/) v10.x
- [Docker](https://www.docker.com/) + Docker Compose
- [jq](https://jqlang.github.io/jq/) (dùng bởi `setup-garage.sh`)

## Bắt Đầu Nhanh

1. **Khởi động hạ tầng**

   ```bash
   docker compose up -d
   ```

2. **Thiết lập bucket lưu trữ Garage**

   ```bash
   ./scripts/setup-garage.sh
   ```

3. **Cài đặt dependencies**

   ```bash
   pnpm install
   ```

4. **Cấu hình môi trường**

   ```bash
   cp .env.sample .env
   # Chỉnh sửa .env với các key S3 từ kết quả setup Garage
   ```

5. **Thiết lập cơ sở dữ liệu**

   ```bash
   pnpm prisma db push
   pnpm prisma db seed
   ```

6. **Khởi động server phát triển**

   ```bash
   pnpm dev
   ```

   Mở [http://localhost:3000](http://localhost:3000). Người dùng đầu tiên đăng ký sẽ tự động trở thành quản trị viên.

## Các Lệnh

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Khởi động server phát triển |
| `pnpm build` | Build production |
| `pnpm start` | Khởi động server production |
| `pnpm test` | Chạy kiểm thử ở chế độ watch |
| `pnpm test:run` | Chạy kiểm thử một lần |
| `pnpm test:coverage` | Chạy kiểm thử với báo cáo coverage |
| `pnpm lint` | Kiểm tra linting (Biome) |
| `pnpm lint:fix` | Tự động sửa lỗi lint |
| `pnpm typecheck` | Kiểm tra kiểu TypeScript |
| `pnpm ci` | Kiểm tra linting nghiêm ngặt cho CI |
| `pnpm prisma studio` | Mở giao diện quản lý database |
| `pnpm prisma db push` | Đẩy schema vào database |
| `pnpm prisma db seed` | Tạo dữ liệu mẫu |
| `pnpm prisma migrate dev` | Tạo và áp dụng migration |

## Cấu Trúc Dự Án

```
├── .agents/              # Quy tắc và kỹ năng agent
├── prisma/               # Schema và dữ liệu seed
├── scripts/              # Script thiết lập hạ tầng
├── public/               # Tài nguyên tĩnh (favicon, manifest)
├── src/
│   ├── components/       # React components
│   ├── lib/              # Thư viện core (auth, db, storage)
│   ├── routes/           # Route dựa trên file (TanStack Start)
│   ├── server/functions/ # Server functions (logic API)
│   ├── styles/           # CSS toàn cục
│   ├── test-utils/       # Fixtures và helpers cho kiểm thử
│   ├── types/            # Định nghĩa kiểu TypeScript
│   └── utils/            # Hàm tiện ích thuần
├── docker-compose.yml    # PostgreSQL + Garage
└── biome.json            # Cấu hình linter/formatter
```

## Ghi Công

Dự án này là bản tái triển khai của [Gia Pha OS](https://github.com/homielab/giapha-os) bởi [Homielab](https://github.com/homielab). Ứng dụng gốc được xây dựng bằng Next.js và Supabase. Bản clone này thay thế các phụ thuộc đám mây bằng các giải pháp tự host, đồng thời giữ nguyên chức năng cốt lõi và giao diện.
