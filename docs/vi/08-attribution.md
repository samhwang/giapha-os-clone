# Ghi Công & Khác Biệt

TL;DR: Dự án này là bản tái triển khai của Gia Pha OS, với những thay đổi kiến trúc đáng kể bao gồm TanStack Start, Better Auth, Prisma, và Garage S3.

## Ghi Công

Dự án này là bản tái triển khai của [Gia Pha OS](https://github.com/homielab/giapha-os) bởi [Homielab](https://github.com/homielab). Ứng dụng gốc được xây dựng bằng Next.js và Supabase. Bản clone này thay thế các phụ thuộc đám mây bằng các giải pháp tự host, đồng thời giữ nguyên chức năng cốt lõi và giao diện.

## Khác Biệt So Với Bản Gốc

Dự án này đã phát triển vượt xa một bản clone trực tiếp. Mục đích ban đầu là giữ nguyên bản gốc không còn phù hợp vì codebase đã khác biệt đáng kể.

## Thay Đổi Kiến Trúc

| Khía cạnh | Bản gốc | Bản Clone này |
|-----------|---------|---------------|
| Framework | Next.js | TanStack Start |
| Xác thực | Supabase Auth | Better Auth |
| Cơ sở dữ liệu | Supabase (PostgreSQL) | Prisma + PostgreSQL |
| Lưu trữ tệp | Supabase Storage | Garage (tương thích S3) |
| Styling | CSS Modules + custom | Tailwind CSS v4 + Framer Motion |

## Cải Tiến Code

- **Server Functions**: Refactor với Prisma client được khởi tạo trong mỗi function thay vì singleton pattern
- **Type Safety**: TypeScript nghiêm ngặt với Zod schema validation tại API boundaries
- **Logic Quan Hệ**: Thêm WeakMap caching cho tính toán tổ tiên, tách các hàm transform có thể tái sử dụng
- **Xử lý lỗi**: Tập trung error constants để hỗ trợ i18n
- **Database**: Thêm indexes cho các cột thường được query (generation, isDeceased, birthYear, isInLaw)
- **Testing**: Coverage toàn diện với Vitest, integration tests với testcontainers

## Quy Ước

- Biome cho linting/formatting (thay thế ESLint + Prettier)
- Atomic commits với Conventional Commits
- Workflow dựa trên agent với `.agents/` rules cho các pattern implementation nhất quán
- Cấu trúc dự án theo module chức năng
