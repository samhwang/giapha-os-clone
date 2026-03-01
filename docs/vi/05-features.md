# Tính Năng

TL;DR: App quản lý cây gia đình với các tính năng genealogy, tính toán quan hệ họ hàng, sự kiện lịch Việt Nam, và hỗ trợ song ngữ.

## Quản Lý Cây Gia Đình

### Thêm Thành Viên

Thành viên được thêm qua dashboard. Mỗi người có:
- Họ tên (bắt buộc)
- Giới tính (nam/nữ/khác)
- Ngày sinh & nơi sinh
- Ngày mất & nơi mất (nếu đã mất)
- Ảnh đại diện
- Số thế hệ
- Thứ tự sinh (anh chị em)
- Thông tin riêng tư (điện thoại, địa chỉ, nghề, ghi chú)

### Quản Lý Quan Hệ

Quan hệ kết nối các thành viên gia đình:

| Loại | Mô tả |
|------|-------------|
| `parent` | Người A là cha/mẹ của Người B |
| `child` | Người A là con của Người B |
| `spouse` | Người A là vợ/chồng của Người B |

### Theo Dõi Thế Hệ

Mỗi người có số `generation`:
- Thế hệ 1: người sáng lập/tổ tiên
- Mỗi con có `generation + 1`

## Tính Toán Quan Hệ Họ Hàng

App tính toán quan hệ gia đình động.

### Cách Hoạt Động

```typescript
import { computeKinship } from '@/relationships/utils/kinshipHelpers'

const result = computeKinship(personA, personB, persons, relationships)
// result: { aCallsB: "ông", bCallsA: "cháu" }
```

### Các Xưng hô

Xưng hô tiếng Việt theo độ chênh lệch thế hệ:

| Chênh lệch thế hệ | Nam | Nữ |
|----------------------|------|-----------|
| -2 | ông nội / ông ngoại | bà nội / bà ngoại |
| -1 | cha / chú / bác | mẹ / cô / dì |
| 0 | anh / em | chị / em |
| +1 | con | con |
| +2 | cháu | cháu |

### Tìm Người Thân

Dùng công cụ Tìm Quan Hệ để tìm xem hai người có quan hệ gì.

## Sự Kiện

### Giỗ

Ngày giỗ theo lịch Việt Nam (lịch âm). Các tính năng:
- Lưu ngày mất (dương lịch)
- Tính ngày giỗ âm lịch
- Hiển thị các ngày giỗ sắp tới
- Hệ thống nhắc nhở (tương lai)

### Sinh Nhật

Theo dõi sinh nhật với:
- Sinh nhật dương lịch
- Sinh nhật âm lịch (tính toán)
- Danh sách sinh nhật sắp tới

## Quốc Tế Hóa (i18n)

App hỗ trợ tiếng Việt và tiếng Anh.

### Chuyển Đổi Ngôn Ngữ

Ngôn ngữ được quản lý qua react-i18next. UI có công tắc chuyển ngôn ngữ.

### Nội Dung Dịch

- Nhãn và nút UI
- Thông báo lỗi
- Xưng hô tiếng Việt
- Định dạng ngày

### Định Dạng Ngày

| Ngôn ngữ | Định dạng |
|-----------|------------|
| Tiếng Việt | DD/MM/YYYY |
| Tiếng Anh | MM/DD/YYYY |

## Tải Lên Hình Ảnh

### Lưu Trữ

Hình ảnh được lưu trong Garage (S3-compatible storage).

### Tải Lên Đại Diện

Thành viên có thể tải ảnh đại diện:
- Định dạng: JPG, PNG, WebP
- Dung lượng: tối đa 5MB
- Lưu trong đường dẫn `avatars/`

### Triển Khai

```typescript
import { uploadFile, deleteFile } from '@/lib/storage'

// Upload
const url = await uploadFile(file, 'avatars/')

// Delete
await deleteFile('avatars/filename.jpg')
```

## Vai Trò Người Dùng

### Các Vai Trò

| Vai trò | Quyền |
|------|-------------|
| `admin` | Toàn quyền, quản lý user, import/export dữ liệu |
| `user` | Xem cây gia đình, thêm/sửa thành viên |

### Ần Quyền

Kiểm tra vai trò trong loaders:

```typescript
loader: async ({ context }) => {
  const session = await context.auth.api.getSession()
  
  if (session?.user.role !== 'admin') {
    throw redirect({ to: '/dashboard' })
  }
}
```

## Import/Export Dữ Liệu

### Export

Export dữ liệu gia đình ra JSON hoặc định dạng GEDCOM (tương lai).

### Import

Import từ:
- Định dạng JSON
- GEDCOM (tương lai)
