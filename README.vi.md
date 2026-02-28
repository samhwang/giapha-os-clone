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

3. **Thiết lập Better Auth token**

   ```bash
   pnpm run auth:secret
   ```

4. **Cài đặt dependencies**

   ```bash
   pnpm install
   ```

5. **Cấu hình môi trường**

   ```bash
   cp .env.sample .env
   # Chỉnh sửa .env với các key S3 từ kết quả setup Garage và Better Auth
   ```

6. **Thiết lập cơ sở dữ liệu**

   ```bash
   pnpm run prisma:migrate:dev
   pnpm run prisma:seed
   ```

7. **Khởi động server phát triển**

   ```bash
   pnpm run dev
   ```

   Mở [http://localhost:3000](http://localhost:3000). Người dùng đầu tiên đăng ký sẽ tự động trở thành quản trị viên.

## Các Lệnh

| Lệnh | Mô tả |
|---|---|
| `pnpm run dev` | Khởi động server phát triển |
| `pnpm run build` | Build production |
| `pnpm run start` | Khởi động server production |
| `pnpm run test` | Chạy kiểm thử ở chế độ watch |
| `pnpm run test:run` | Chạy kiểm thử một lần |
| `pnpm run test:coverage` | Chạy kiểm thử với báo cáo coverage |
| `pnpm run test:ui` | Chạy kiểm thử UI components |
| `pnpm run test:server` | Chạy kiểm thử server functions |
| `pnpm run test:integration` | Chạy kiểm thử tích hợp |
| `pnpm run test:browser` | Chạy kiểm thử browser (E2E) ở chế độ watch |
| `pnpm run test:browser:run` | Chạy kiểm thử browser (E2E) một lần |
| `pnpm run lint` | Kiểm tra linting (Biome) |
| `pnpm run lint:fix` | Tự động sửa lỗi lint |
| `pnpm run typecheck` | Kiểm tra kiểu TypeScript |
| `pnpm run ci` | Kiểm tra linting nghiêm ngặt cho CI |
| `pnpm run prisma:studio` | Mở giao diện quản lý database |
| `pnpm run prisma:push` | Đẩy schema vào database |
| `pnpm run prisma:generate` | Generate Prisma client |
| `pnpm run prisma:seed` | Tạo dữ liệu mẫu |
| `pnpm run prisma:migrate:dev` | Tạo và áp dụng migration |
| `pnpm run prisma:migrate:prod` | Deploy migration |
| `pnpm run prisma:format` | Format Prisma schema |
| `pnpm run auth:secret` | Tạo Better Auth secret |
| `pnpm run auth:generate` | Generate Better Auth client |

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

## Kiểm thử

Dự án này sử dụng Vitest với nhiều loại kiểm thử:

| Loại | Mô tả | Lệnh |
|-------|-------------|---------|
| Unit | Hàm tiện ích, logic thuần | `pnpm run test:ui` |
| Server | Server functions với Prisma mocked | `pnpm run test:server` |
| Integration | Kiểm thử cấp route với jsdom | `pnpm run test:integration` |
| Browser | Kiểm thử E2E với Chromium thực qua Playwright | `pnpm run test:browser:run` |

Kiểm thử browser chạy trên Chromium thực và kiểm thử các luồng người dùng hoàn chỉnh mà không mock các API của browser. Sử dụng file pattern `*.browser-test.tsx` cho kiểm thử browser.

Kiểm thử kiểu (type tests) có thể được inline trong các file test sử dụng `expectTypeOf` từ vitest.

## Ghi Công

Dự án này là bản tái triển khai của [Gia Pha OS](https://github.com/homielab/giapha-os) bởi [Homielab](https://github.com/homielab). Ứng dụng gốc được xây dựng bằng Next.js và Supabase. Bản clone này thay thế các phụ thuộc đám mây bằng các giải pháp tự host, đồng thời giữ nguyên chức năng cốt lõi và giao diện.

## Khác Biệt So Với Bản Gốc

Dự án này đã phát triển vượt xa một bản clone trực tiếp. Mục đích ban đầu là giữ nguyên bản gốc không còn phù hợp vì codebase đã khác biệt đáng kể:

### Thay Đổi Kiến Trúc

| Khía cạnh | Bản gốc | Bản Clone này |
|-----------|---------|---------------|
| Framework | Next.js | TanStack Start |
| Xác thực | Supabase Auth | Better Auth |
| Cơ sở dữ liệu | Supabase (PostgreSQL) | Prisma + PostgreSQL |
| Lưu trữ tệp | Supabase Storage | Garage (tương thích S3) |
| Styling | CSS Modules + custom | Tailwind CSS v4 + Framer Motion |

### Cải Tiến Code

- **Server Functions**: Refactor với Prisma client được khởi tạo trong mỗi function thay vì singleton pattern
- **Type Safety**: TypeScript nghiêm ngặt với Zod schema validation tại API boundaries
- **Logic Quan Hệ**: Thêm WeakMap caching cho tính toán tổ tiên, tách các hàm transform có thể tái sử dụng
- **Xử lý lỗi**: Tập trung error constants để hỗ trợ i18n
- **Database**: Thêm indexes cho các cột thường được query (generation, isDeceased, birthYear, isInLaw)
- **Testing**: Coverage toàn diện với Vitest, integration tests với testcontainers

### Quy Ước

- Biome cho linting/formatting (thay thế ESLint + Prettier)
- Atomic commits với Conventional Commits
- Workflow dựa trên agent với `.agents/` rules cho các pattern implementation nhất quán
- Cấu trúc dự án theo module chức năng
