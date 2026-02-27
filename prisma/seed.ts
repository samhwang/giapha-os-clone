import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.relationship.deleteMany();
  await prisma.personDetailsPrivate.deleteMany();
  await prisma.person.deleteMany();

  // ============================================================
  // Generation 1 — Ancestors (born ~1900-1920)
  // ============================================================
  await prisma.person.createMany({
    data: [
      {
        id: '10000000-0000-0000-0000-000000000001',
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
      {
        id: '10000000-0000-0000-0000-000000000002',
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
    ],
  });

  // ============================================================
  // Generation 2 — Grandparents (born ~1930-1950)
  // ============================================================
  await prisma.person.createMany({
    data: [
      {
        id: '20000000-0000-0000-0000-000000000001',
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
      {
        id: '20000000-0000-0000-0000-000000000002',
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
      {
        id: '20000000-0000-0000-0000-000000000003',
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
      {
        id: '20000000-0000-0000-0000-000000000004',
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
      {
        id: '20000000-0000-0000-0000-000000000005',
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
    ],
  });

  // ============================================================
  // Generation 3 — Parents/uncles/aunts (born ~1955-1975)
  // ============================================================
  await prisma.person.createMany({
    data: [
      {
        id: '30000000-0000-0000-0000-000000000001',
        fullName: 'Vạn Công Trí',
        gender: 'male',
        birthYear: 1958,
        birthMonth: 4,
        birthDay: 12,
        generation: 3,
        birthOrder: 1,
        note: 'Con trai trưởng của ông Thuận. Kỹ sư xây dựng.',
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        fullName: 'Ngô Thị Dịu Hiền',
        gender: 'female',
        birthYear: 1961,
        birthMonth: 8,
        birthDay: 25,
        isInLaw: true,
        generation: 3,
        note: 'Vợ của anh Trí. Giáo viên dạy Văn nghỉ hưu.',
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        fullName: 'Vạn Thị Cẩm',
        gender: 'female',
        birthYear: 1962,
        birthMonth: 11,
        birthDay: 3,
        generation: 3,
        birthOrder: 2,
        note: 'Con gái thứ hai. Bác sĩ nhi khoa.',
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        fullName: 'Tề Văn Chính',
        gender: 'female',
        birthYear: 1959,
        birthMonth: 5,
        birthDay: 18,
        isInLaw: true,
        generation: 3,
        note: 'Chồng của bác Cẩm. Luật sư.',
      },
      {
        id: '30000000-0000-0000-0000-000000000005',
        fullName: 'Vạn Công Mộc',
        gender: 'male',
        birthYear: 1967,
        birthMonth: 6,
        birthDay: 20,
        generation: 3,
        birthOrder: 3,
        note: 'Con trai út của ông Thuận. Mở xưởng mộc.',
      },
      {
        id: '30000000-0000-0000-0000-000000000006',
        fullName: 'Quế Thị Lam',
        gender: 'female',
        birthYear: 1970,
        birthMonth: 2,
        birthDay: 14,
        isInLaw: true,
        generation: 3,
        note: 'Vợ của chú Mộc. Hát dân ca hay.',
      },
      {
        id: '30000000-0000-0000-0000-000000000007',
        fullName: 'Vạn Viễn Tuệ',
        gender: 'male',
        birthYear: 1970,
        birthMonth: 9,
        birthDay: 5,
        generation: 3,
        birthOrder: 1,
        note: 'Con trai cả ở Sài Gòn. Kỹ sư tin học.',
      },
      {
        id: '30000000-0000-0000-0000-000000000008',
        fullName: 'Vạn Viễn Thanh',
        gender: 'female',
        birthYear: 1973,
        birthMonth: 4,
        birthDay: 22,
        generation: 3,
        birthOrder: 2,
        note: 'Con gái ở Sài Gòn. Giáo viên tiếng Anh.',
      },
      {
        id: '30000000-0000-0000-0000-000000000009',
        fullName: 'Liêu Văn Kiến',
        gender: 'male',
        birthYear: 1971,
        birthMonth: 11,
        birthDay: 30,
        isInLaw: true,
        generation: 3,
        note: 'Chồng của cô Thanh. Kiến trúc sư.',
      },
    ],
  });

  // ============================================================
  // Generation 4 — Grandchildren (born ~1988-2010)
  // ============================================================
  await prisma.person.createMany({
    data: [
      {
        id: '40000000-0000-0000-0000-000000000001',
        fullName: 'Vạn Trí Minh',
        gender: 'male',
        birthYear: 1989,
        birthMonth: 3,
        birthDay: 14,
        generation: 4,
        birthOrder: 1,
        note: 'Lập trình viên fullstack, tác giả dự án Gia Pha OS.',
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        fullName: 'Đinh Thị Mỹ Duyên',
        gender: 'female',
        birthYear: 1991,
        birthMonth: 7,
        birthDay: 8,
        isInLaw: true,
        generation: 4,
        note: 'Vợ của anh Minh. Nhà thiết kế UI/UX.',
      },
      {
        id: '40000000-0000-0000-0000-000000000003',
        fullName: 'Vạn Trí Ngọc',
        gender: 'female',
        birthYear: 1992,
        birthMonth: 12,
        birthDay: 25,
        generation: 4,
        birthOrder: 2,
        note: 'Nghiên cứu sinh Tiến sĩ Hóa học.',
      },
      {
        id: '40000000-0000-0000-0000-000000000004',
        fullName: 'Vạn Trí Khang',
        gender: 'male',
        birthYear: 1998,
        birthMonth: 1,
        birthDay: 30,
        generation: 4,
        birthOrder: 3,
        note: 'Sinh viên Kinh tế, thích bóng đá và chơi guitar.',
      },
      {
        id: '40000000-0000-0000-0000-000000000005',
        fullName: 'Tề Vạn Liên',
        gender: 'female',
        birthYear: 1990,
        birthMonth: 5,
        birthDay: 20,
        generation: 4,
        birthOrder: 1,
        note: 'Con gái bác Cẩm. Dược sĩ bệnh viện.',
      },
      {
        id: '40000000-0000-0000-0000-000000000006',
        fullName: 'Tề Vạn Hào',
        gender: 'male',
        birthYear: 1993,
        birthMonth: 8,
        birthDay: 11,
        generation: 4,
        birthOrder: 2,
        note: 'Con trai bác Cẩm. Phi công hàng không.',
      },
      {
        id: '40000000-0000-0000-0000-000000000007',
        fullName: 'Vạn Mộc Kiên',
        gender: 'male',
        birthYear: 1995,
        birthMonth: 10,
        birthDay: 15,
        generation: 4,
        birthOrder: 1,
        note: 'Con trai chú Mộc. Thiết kế nội thất.',
      },
      {
        id: '40000000-0000-0000-0000-000000000008',
        fullName: 'Vạn Mộc Ngân',
        gender: 'female',
        birthYear: 1999,
        birthMonth: 3,
        birthDay: 3,
        generation: 4,
        birthOrder: 2,
        note: 'Con gái chú Mộc. Tốt nghiệp Tài chính - Ngân hàng.',
      },
      {
        id: '40000000-0000-0000-0000-000000000009',
        fullName: 'Vạn Tuệ An',
        gender: 'male',
        birthYear: 2000,
        birthMonth: 6,
        birthDay: 18,
        generation: 4,
        birthOrder: 1,
        note: 'Con trai anh Tuệ. Đang học IT tại TP.HCM.',
      },
      {
        id: '40000000-0000-0000-0000-000000000010',
        fullName: 'Liêu Vạn Bình',
        gender: 'female',
        birthYear: 2003,
        birthMonth: 2,
        birthDay: 28,
        generation: 4,
        birthOrder: 1,
        note: 'Con gái cô Thanh. Giỏi tiếng Anh.',
      },
      {
        id: '40000000-0000-0000-0000-000000000011',
        fullName: 'Liêu Vạn Kỳ',
        gender: 'male',
        birthYear: 2007,
        birthMonth: 9,
        birthDay: 9,
        generation: 4,
        birthOrder: 2,
        note: 'Con trai cô Thanh. Thích đá bóng và vẽ truyện tranh manga.',
      },
    ],
  });

  // ============================================================
  // Private details (admin only)
  // ============================================================
  await prisma.personDetailsPrivate.createMany({
    data: [
      { personId: '30000000-0000-0000-0000-000000000001', phoneNumber: '09xx xxx 001', occupation: 'Kỹ sư xây dựng (đã nghỉ hưu)', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: '30000000-0000-0000-0000-000000000002', phoneNumber: '09xx xxx 002', occupation: 'Giáo viên Văn (đã nghỉ hưu)', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: '30000000-0000-0000-0000-000000000003', phoneNumber: '09xx xxx 003', occupation: 'Bác sĩ Nhi khoa', currentResidence: 'Đống Đa, Hà Nội' },
      { personId: '30000000-0000-0000-0000-000000000005', phoneNumber: '09xx xxx 005', occupation: 'Chủ xưởng mộc', currentResidence: 'Hà Đông, Hà Nội' },
      { personId: '30000000-0000-0000-0000-000000000007', phoneNumber: '09xx xxx 007', occupation: 'Kỹ sư Tin học', currentResidence: 'Quận 7, TP.HCM' },
      { personId: '40000000-0000-0000-0000-000000000001', phoneNumber: '09xx xxx 101', occupation: 'Lập trình viên Fullstack', currentResidence: 'Cầu Giấy, Hà Nội' },
      { personId: '40000000-0000-0000-0000-000000000002', phoneNumber: '09xx xxx 102', occupation: 'Nhà thiết kế UI/UX', currentResidence: 'Cầu Giấy, Hà Nội' },
      { personId: '40000000-0000-0000-0000-000000000003', phoneNumber: '09xx xxx 103', occupation: 'Nghiên cứu sinh Tiến sĩ', currentResidence: 'Đống Đa, Hà Nội' },
      { personId: '40000000-0000-0000-0000-000000000005', phoneNumber: '09xx xxx 105', occupation: 'Dược sĩ bệnh viện', currentResidence: 'Thanh Xuân, Hà Nội' },
      { personId: '40000000-0000-0000-0000-000000000006', phoneNumber: '09xx xxx 106', occupation: 'Phi công hàng không', currentResidence: 'Long Biên, Hà Nội' },
    ],
  });

  // ============================================================
  // Relationships
  // ============================================================

  // Generation 1 marriage
  await prisma.relationship.create({
    data: { type: 'marriage', personAId: '10000000-0000-0000-0000-000000000001', personBId: '10000000-0000-0000-0000-000000000002' },
  });

  // Gen 1 → Gen 2 (both parents for each child)
  const gen1to2 = [
    ['10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'],
    ['10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'],
    ['10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'],
    ['10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'],
    ['10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004'],
    ['10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004'],
  ];
  await prisma.relationship.createMany({
    data: gen1to2.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 2 marriages
  await prisma.relationship.createMany({
    data: [
      { type: 'marriage', personAId: '20000000-0000-0000-0000-000000000001', personBId: '20000000-0000-0000-0000-000000000002' },
      { type: 'marriage', personAId: '20000000-0000-0000-0000-000000000004', personBId: '20000000-0000-0000-0000-000000000005' },
    ],
  });

  // Gen 2 → Gen 3 (Thuan & Diu branch)
  const gen2to3North = [
    ['20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'],
    ['20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001'],
    ['20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'],
    ['20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'],
    ['20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005'],
    ['20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005'],
  ];
  await prisma.relationship.createMany({
    data: gen2to3North.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 2 → Gen 3 (Vien & Kheo branch)
  const gen2to3South = [
    ['20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007'],
    ['20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007'],
    ['20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000008'],
    ['20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000008'],
  ];
  await prisma.relationship.createMany({
    data: gen2to3South.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 marriages
  await prisma.relationship.createMany({
    data: [
      { type: 'marriage', personAId: '30000000-0000-0000-0000-000000000001', personBId: '30000000-0000-0000-0000-000000000002' },
      { type: 'marriage', personAId: '30000000-0000-0000-0000-000000000003', personBId: '30000000-0000-0000-0000-000000000004' },
      { type: 'marriage', personAId: '30000000-0000-0000-0000-000000000005', personBId: '30000000-0000-0000-0000-000000000006' },
      { type: 'marriage', personAId: '30000000-0000-0000-0000-000000000008', personBId: '30000000-0000-0000-0000-000000000009' },
    ],
  });

  // Gen 3 → Gen 4 (Tri & Diu Hien children)
  const gen3to4Tri = [
    ['30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'],
    ['30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'],
    ['30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003'],
    ['30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003'],
    ['30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004'],
    ['30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004'],
  ];
  await prisma.relationship.createMany({
    data: gen3to4Tri.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Cam & Chinh children)
  const gen3to4Cam = [
    ['30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005'],
    ['30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000005'],
    ['30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006'],
    ['30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000006'],
  ];
  await prisma.relationship.createMany({
    data: gen3to4Cam.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Moc & Lam children)
  const gen3to4Moc = [
    ['30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007'],
    ['30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000007'],
    ['30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000008'],
    ['30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000008'],
  ];
  await prisma.relationship.createMany({
    data: gen3to4Moc.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 3 → Gen 4 (Tue - HCM)
  await prisma.relationship.create({
    data: { type: 'biological_child', personAId: '30000000-0000-0000-0000-000000000007', personBId: '40000000-0000-0000-0000-000000000009' },
  });

  // Gen 3 → Gen 4 (Thanh & Kien - HCM)
  const gen3to4Thanh = [
    ['30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000010'],
    ['30000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000010'],
    ['30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000011'],
    ['30000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000011'],
  ];
  await prisma.relationship.createMany({
    data: gen3to4Thanh.map(([a, b]) => ({ type: 'biological_child' as const, personAId: a, personBId: b })),
  });

  // Gen 4 marriage
  await prisma.relationship.create({
    data: { type: 'marriage', personAId: '40000000-0000-0000-0000-000000000001', personBId: '40000000-0000-0000-0000-000000000002' },
  });

  console.log('Seed complete: 27 persons, 10 private details, ~45 relationships');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
