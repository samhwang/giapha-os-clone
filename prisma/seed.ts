import '@dotenvx/dotenvx/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await db.relationship.deleteMany();
  await db.personDetailsPrivate.deleteMany();
  await db.person.deleteMany();

  // ============================================================
  // Generation 1 — Ancestors (born ~1900-1920)
  // ============================================================
  const goc = await db.person.create({
    data: {
      fullName: 'Vạn Công Gốc',
      gender: 'male',
      birthYear: 1902,
      birthMonth: 3,
      birthDay: 15,
      deathYear: 1975,
      deathMonth: 8,
      deathDay: 22,
      isDeceased: true,
      isInLaw: false,
      generation: 1,
      note: 'Ông tổ dòng họ Vạn. Xuất thân nông dân, người có công khai phá vùng đất và lập nên dòng tộc.',
    },
  });

  const mocBa = await db.person.create({
    data: {
      fullName: 'Bình Thị Mộc',
      gender: 'female',
      birthYear: 1908,
      birthMonth: 6,
      birthDay: 10,
      deathYear: 1980,
      deathMonth: 1,
      deathDay: 5,
      isDeceased: true,
      isInLaw: true,
      generation: 1,
      note: 'Tổ mẫu, người vợ đảm đang một tay nuôi dạy con cái qua thời chiến loạn.',
    },
  });

  // ============================================================
  // Generation 2 — Grandparents (born ~1930-1950)
  // ============================================================
  const thuan = await db.person.create({
    data: {
      fullName: 'Vạn Công Thuận',
      gender: 'male',
      birthYear: 1930,
      birthMonth: 2,
      birthDay: 4,
      deathYear: 2008,
      deathMonth: 11,
      deathDay: 30,
      isDeceased: true,
      generation: 2,
      birthOrder: 1,
      note: 'Con trai trưởng, từng là cán bộ địa phương. Để lại cuốn gia phả viết tay.',
    },
  });

  const diu = await db.person.create({
    data: {
      fullName: 'Cam Thị Dịu',
      gender: 'female',
      birthYear: 1934,
      birthMonth: 9,
      birthDay: 20,
      deathYear: 2012,
      deathMonth: 4,
      deathDay: 14,
      isDeceased: true,
      isInLaw: true,
      generation: 2,
      note: 'Vợ của ông Thuận, con gái nhà buôn. Giỏi nấu ăn truyền thống.',
    },
  });

  const binh = await db.person.create({
    data: {
      fullName: 'Vạn Thị Bình',
      gender: 'female',
      birthYear: 1935,
      birthMonth: 7,
      birthDay: 7,
      isDeceased: false,
      generation: 2,
      birthOrder: 2,
      note: 'Con gái thứ hai, dạy học cấp 2 hơn 30 năm. Không lấy chồng.',
    },
  });

  const vien = await db.person.create({
    data: {
      fullName: 'Vạn Công Viễn',
      gender: 'male',
      birthYear: 1942,
      birthMonth: 12,
      birthDay: 1,
      isDeceased: false,
      generation: 2,
      birthOrder: 3,
      note: 'Con trai út, vào Nam năm 1975, định cư tại TP.HCM.',
    },
  });

  const kheo = await db.person.create({
    data: {
      fullName: 'Tân Thị Khéo',
      gender: 'female',
      birthYear: 1945,
      birthMonth: 3,
      birthDay: 8,
      isDeceased: false,
      isInLaw: true,
      generation: 2,
      note: 'Vợ của ông Viễn. Thực sự điều hành cửa hàng vật liệu của gia đình.',
    },
  });

  // ============================================================
  // Generation 3 — Parents/uncles/aunts (born ~1955-1975)
  // ============================================================
  const tri = await db.person.create({
    data: {
      fullName: 'Vạn Công Trí',
      gender: 'male',
      birthYear: 1958,
      birthMonth: 4,
      birthDay: 12,
      generation: 3,
      birthOrder: 1,
      note: 'Con trai trưởng của ông Thuận. Kỹ sư xây dựng.',
    },
  });

  const diuHien = await db.person.create({
    data: {
      fullName: 'Ngô Thị Dịu Hiền',
      gender: 'female',
      birthYear: 1961,
      birthMonth: 8,
      birthDay: 25,
      isInLaw: true,
      generation: 3,
      note: 'Vợ của anh Trí. Giáo viên dạy Văn nghỉ hưu.',
    },
  });

  const cam = await db.person.create({
    data: {
      fullName: 'Vạn Thị Cẩm',
      gender: 'female',
      birthYear: 1962,
      birthMonth: 11,
      birthDay: 3,
      generation: 3,
      birthOrder: 2,
      note: 'Con gái thứ hai. Bác sĩ nhi khoa.',
    },
  });

  const chinh = await db.person.create({
    data: {
      fullName: 'Tề Văn Chính',
      gender: 'female',
      birthYear: 1959,
      birthMonth: 5,
      birthDay: 18,
      isInLaw: true,
      generation: 3,
      note: 'Chồng của bác Cẩm. Luật sư.',
    },
  });

  const mocChu = await db.person.create({
    data: {
      fullName: 'Vạn Công Mộc',
      gender: 'male',
      birthYear: 1967,
      birthMonth: 6,
      birthDay: 20,
      generation: 3,
      birthOrder: 3,
      note: 'Con trai út của ông Thuận. Mở xưởng mộc.',
    },
  });

  const lam = await db.person.create({
    data: {
      fullName: 'Quế Thị Lam',
      gender: 'female',
      birthYear: 1970,
      birthMonth: 2,
      birthDay: 14,
      isInLaw: true,
      generation: 3,
      note: 'Vợ của chú Mộc. Hát dân ca hay.',
    },
  });

  const tue = await db.person.create({
    data: {
      fullName: 'Vạn Viễn Tuệ',
      gender: 'male',
      birthYear: 1970,
      birthMonth: 9,
      birthDay: 5,
      generation: 3,
      birthOrder: 1,
      note: 'Con trai cả ở Sài Gòn. Kỹ sư tin học.',
    },
  });

  const thanh = await db.person.create({
    data: {
      fullName: 'Vạn Viễn Thanh',
      gender: 'female',
      birthYear: 1973,
      birthMonth: 4,
      birthDay: 22,
      generation: 3,
      birthOrder: 2,
      note: 'Con gái ở Sài Gòn. Giáo viên tiếng Anh.',
    },
  });

  const kien = await db.person.create({
    data: {
      fullName: 'Liêu Văn Kiến',
      gender: 'male',
      birthYear: 1971,
      birthMonth: 11,
      birthDay: 30,
      isInLaw: true,
      generation: 3,
      note: 'Chồng của cô Thanh. Kiến trúc sư.',
    },
  });

  // ============================================================
  // Generation 4 — Grandchildren (born ~1988-2010)
  // ============================================================
  const triMinh = await db.person.create({
    data: {
      fullName: 'Vạn Trí Minh',
      gender: 'male',
      birthYear: 1989,
      birthMonth: 3,
      birthDay: 14,
      generation: 4,
      birthOrder: 1,
      note: 'Lập trình viên fullstack, tác giả dự án Gia Pha OS.',
    },
  });

  const myDuyen = await db.person.create({
    data: {
      fullName: 'Đinh Thị Mỹ Duyên',
      gender: 'female',
      birthYear: 1991,
      birthMonth: 7,
      birthDay: 8,
      isInLaw: true,
      generation: 4,
      note: 'Vợ của anh Minh. Nhà thiết kế UI/UX.',
    },
  });

  const triNgoc = await db.person.create({
    data: {
      fullName: 'Vạn Trí Ngọc',
      gender: 'female',
      birthYear: 1992,
      birthMonth: 12,
      birthDay: 25,
      generation: 4,
      birthOrder: 2,
      note: 'Nghiên cứu sinh Tiến sĩ Hóa học.',
    },
  });

  const triKhang = await db.person.create({
    data: {
      fullName: 'Vạn Trí Khang',
      gender: 'male',
      birthYear: 1998,
      birthMonth: 1,
      birthDay: 30,
      generation: 4,
      birthOrder: 3,
      note: 'Sinh viên Kinh tế, thích bóng đá và chơi guitar.',
    },
  });

  const vanLien = await db.person.create({
    data: {
      fullName: 'Tề Vạn Liên',
      gender: 'female',
      birthYear: 1990,
      birthMonth: 5,
      birthDay: 20,
      generation: 4,
      birthOrder: 1,
      note: 'Con gái bác Cẩm. Dược sĩ bệnh viện.',
    },
  });

  const vanHao = await db.person.create({
    data: {
      fullName: 'Tề Vạn Hào',
      gender: 'male',
      birthYear: 1993,
      birthMonth: 8,
      birthDay: 11,
      generation: 4,
      birthOrder: 2,
      note: 'Con trai bác Cẩm. Phi công hàng không.',
    },
  });

  const mocKien = await db.person.create({
    data: {
      fullName: 'Vạn Mộc Kiên',
      gender: 'male',
      birthYear: 1995,
      birthMonth: 10,
      birthDay: 15,
      generation: 4,
      birthOrder: 1,
      note: 'Con trai chú Mộc. Thiết kế nội thất.',
    },
  });

  const mocNgan = await db.person.create({
    data: {
      fullName: 'Vạn Mộc Ngân',
      gender: 'female',
      birthYear: 1999,
      birthMonth: 3,
      birthDay: 3,
      generation: 4,
      birthOrder: 2,
      note: 'Con gái chú Mộc. Tốt nghiệp Tài chính - Ngân hàng.',
    },
  });

  const tueAn = await db.person.create({
    data: {
      fullName: 'Vạn Tuệ An',
      gender: 'male',
      birthYear: 2000,
      birthMonth: 6,
      birthDay: 18,
      generation: 4,
      birthOrder: 1,
      note: 'Con trai anh Tuệ. Đang học IT tại TP.HCM.',
    },
  });

  const vanBinh = await db.person.create({
    data: {
      fullName: 'Liêu Vạn Bình',
      gender: 'female',
      birthYear: 2003,
      birthMonth: 2,
      birthDay: 28,
      generation: 4,
      birthOrder: 1,
      note: 'Con gái cô Thanh. Giỏi tiếng Anh.',
    },
  });

  const vanKy = await db.person.create({
    data: {
      fullName: 'Liêu Vạn Kỳ',
      gender: 'male',
      birthYear: 2007,
      birthMonth: 9,
      birthDay: 9,
      generation: 4,
      birthOrder: 2,
      note: 'Con trai cô Thanh. Thích đá bóng và vẽ truyện tranh manga.',
    },
  });

  // ============================================================
  // Private details (admin only)
  // ============================================================
  await db.personDetailsPrivate.createMany({
    data: [
      { personId: tri.id, phoneNumber: '09xx xxx 001', occupation: 'Kỹ sư xây dựng (đã nghỉ hưu)', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: diuHien.id, phoneNumber: '09xx xxx 002', occupation: 'Giáo viên Văn (đã nghỉ hưu)', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: cam.id, phoneNumber: '09xx xxx 003', occupation: 'Bác sĩ Nhi khoa', currentResidence: 'Đống Đa, Hà Nội' },
      { personId: mocChu.id, phoneNumber: '09xx xxx 005', occupation: 'Chủ xưởng mộc', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: tue.id, phoneNumber: '09xx xxx 007', occupation: 'Kỹ sư Tin học', currentResidence: 'Quận 7, TP.HCM' },
      { personId: triMinh.id, phoneNumber: '09xx xxx 101', occupation: 'Lập trình viên Fullstack', currentResidence: 'Cầu Giấy, Hà Nội' },
      { personId: myDuyen.id, phoneNumber: '09xx xxx 102', occupation: 'Nhà thiết kế UI/UX', currentResidence: 'Cầu Giấy, Hà Nội' },
      { personId: triNgoc.id, phoneNumber: '09xx xxx 103', occupation: 'Nghiên cứu sinh Tiến sĩ', currentResidence: 'Đống Đa, Hà Nội' },
      { personId: vanLien.id, phoneNumber: '09xx xxx 105', occupation: 'Dược sĩ bệnh viện', currentResidence: 'Thanh Xuân, Hà Nội' },
      { personId: vanHao.id, phoneNumber: '09xx xxx 106', occupation: 'Phi công hàng không', currentResidence: 'Long Biên, Hà Nội' },
    ],
  });

  // ============================================================
  // Relationships
  // ============================================================

  // Generation 1 marriage
  await db.relationship.create({
    data: { type: 'marriage', personAId: goc.id, personBId: mocBa.id },
  });

  // Gen 1 → Gen 2 (both parents for each child)
  const gen1to2: [string, string][] = [
    [goc.id, thuan.id],
    [mocBa.id, thuan.id],
    [goc.id, binh.id],
    [mocBa.id, binh.id],
    [goc.id, vien.id],
    [mocBa.id, vien.id],
  ];
  await db.relationship.createMany({
    data: gen1to2.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 2 marriages
  await db.relationship.createMany({
    data: [
      { type: 'marriage', personAId: thuan.id, personBId: diu.id },
      { type: 'marriage', personAId: vien.id, personBId: kheo.id },
    ],
  });

  // Gen 2 → Gen 3 (Thuan & Diu branch)
  const gen2to3North: [string, string][] = [
    [thuan.id, tri.id],
    [diu.id, tri.id],
    [thuan.id, cam.id],
    [diu.id, cam.id],
    [thuan.id, mocChu.id],
    [diu.id, mocChu.id],
  ];
  await db.relationship.createMany({
    data: gen2to3North.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 2 → Gen 3 (Vien & Kheo branch)
  const gen2to3South: [string, string][] = [
    [vien.id, tue.id],
    [kheo.id, tue.id],
    [vien.id, thanh.id],
    [kheo.id, thanh.id],
  ];
  await db.relationship.createMany({
    data: gen2to3South.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 marriages
  await db.relationship.createMany({
    data: [
      { type: 'marriage', personAId: tri.id, personBId: diuHien.id },
      { type: 'marriage', personAId: cam.id, personBId: chinh.id },
      { type: 'marriage', personAId: mocChu.id, personBId: lam.id },
      { type: 'marriage', personAId: thanh.id, personBId: kien.id },
    ],
  });

  // Gen 3 → Gen 4 (Tri & Diu Hien children)
  const gen3to4Tri: [string, string][] = [
    [tri.id, triMinh.id],
    [diuHien.id, triMinh.id],
    [tri.id, triNgoc.id],
    [diuHien.id, triNgoc.id],
    [tri.id, triKhang.id],
    [diuHien.id, triKhang.id],
  ];
  await db.relationship.createMany({
    data: gen3to4Tri.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Cam & Chinh children)
  const gen3to4Cam: [string, string][] = [
    [cam.id, vanLien.id],
    [chinh.id, vanLien.id],
    [cam.id, vanHao.id],
    [chinh.id, vanHao.id],
  ];
  await db.relationship.createMany({
    data: gen3to4Cam.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Moc & Lam children)
  const gen3to4Moc: [string, string][] = [
    [mocChu.id, mocKien.id],
    [lam.id, mocKien.id],
    [mocChu.id, mocNgan.id],
    [lam.id, mocNgan.id],
  ];
  await db.relationship.createMany({
    data: gen3to4Moc.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Tue - HCM)
  await db.relationship.create({
    data: { type: 'biological_child', personAId: tue.id, personBId: tueAn.id },
  });

  // Gen 3 → Gen 4 (Thanh & Kien - HCM)
  const gen3to4Thanh: [string, string][] = [
    [thanh.id, vanBinh.id],
    [kien.id, vanBinh.id],
    [thanh.id, vanKy.id],
    [kien.id, vanKy.id],
  ];
  await db.relationship.createMany({
    data: gen3to4Thanh.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 4 marriage
  await db.relationship.create({
    data: { type: 'marriage', personAId: triMinh.id, personBId: myDuyen.id },
  });

  console.log('Seed complete: 27 persons, 10 private details, ~45 relationships');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
