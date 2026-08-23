<div align="center">

# 🎖️ NCO 1333 — เพื่อนกันจนวันตาย

**ระบบจัดการข้อมูลเครือข่ายนักเรียนนายสิบรุ่นที่ 1333**

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 📋 สารบัญ

- [เกี่ยวกับโปรเจค](#-เกี่ยวกับโปรเจค)
- [ฟีเจอร์ทั้งหมด](#-ฟีเจอร์ทั้งหมด)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [เริ่มต้นใช้งาน](#-เริ่มต้นใช้งาน)
- [ตั้งค่า Supabase](#-ตั้งค่า-supabase)
- [ตั้งค่า Admin](#-ตั้งค่า-admin)
- [Deploy ขึ้น Vercel](#-deploy-ขึ้น-vercel)
- [คำสั่งที่ใช้บ่อย](#-คำสั่งที่ใช้บ่อย)
- [License](#-license)

---

## 🎯 เกี่ยวกับโปรเจค

ระบบเว็บไซต์สำหรับ **นักเรียนนายสิบรุ่นที่ 1333 ปี 52** ใช้สำหรับ:

- 📇 จัดการรายชื่อเพื่อนๆ ในรุ่น
- 📅 แจ้งกิจกรรมและนับถอยหลัง
- 📰 ประชาสัมพันธ์ข่าวสาร
- 📊 จัดทำแบบสำรวจ/โหวต
- 💬 กระดานสนทนาแลกเปลี่ยนข้อมูล

---

## 🌟 ฟีเจอร์ทั้งหมด

### 📇 รายชื่อบุคลากร
- ตารางรายชื่อพร้อมค้นหาและกรอง
- กรองตาม **ยศ**, **เหล่า**, **กองร้อย**, **ที่ทำงาน**
- แสดงข้อมูลติดต่อ (เบอร์โทร, LINE ID)
- **ขอเพิ่มรายชื่อ** — ฟอร์มสำหรับคนทั่วไปกรอกขอเพิ่มชื่อ
- **แก้ไขรายชื่อ** — Login แล้วแก้ไขได้เลย / ยังไม่ Login ส่งคำขอแก้ไขให้ Admin อนุมัติ

### 📅 ระบบกิจกรรม
- แจ้งกิจกรรมพร้อมวัน เวลา สถานที่
- **4 สถานะ**: สำรวจ → ยืนยัน → กำลังดำเนินการ → จบแล้ว
- **นับถอยหลัง** — แสดงจำนวนวันที่เหลือสำหรับกิจกรรมที่ยืนยันแล้ว
- **เปลี่ยนสถานะอัตโนมัติ** — เมื่อถึงวันกิจกรรมเปลี่ยนเป็น "กำลังดำเนินการ" / เมื่อผ่านไปเปลี่ยนเป็น "จบแล้ว"
- สถานะ **สำรวจ** แก้ไขได้

### 📰 ข่าวสาร / ประชาสัมพันธ์
- แจ้งข่าว 4 ประเภท: ประชาสัมพันธ์, แสดงความยินดี, สูญเสีย, อื่นๆ
- แนบรูปภาพได้หลายรูป
- **วันหมดอายุ** — หมดอายุอัตโนมัติ 30 วัน (แก้ไขได้) / ซ่อนจากหน้าหลัก / แสดงใน Admin

### 📊 แบบสำรวจ / โหวต
- สร้างหัวข้อโหวตพร้อมตัวเลือก 2-6 ข้อ
- แนบรูปภาพได้หลายรูป (เลือกทีละรูป)
- **วันปิดโหวต** + นับถอยหลัง
- 1 คน 1 โหวต (UNIQUE)
- แสดงผลโหวตแบบ real-time (%)
- ลบรูปจาก Storage อัตโนมัติเมื่อลบโหวต

### 💬 กระดานสนทนา
- โพสต์ข้อความพร้อมคอมเมนต์ตอบกลับ
- นับคอมเมนต์แบบ real-time
- **โพสต์ไม่เคลื่อนไหว** — Admin เห็นโพสต์ที่ไม่มีคอมเมนต์เกิน 7 วัน จัดการลบได้

### 🛡️ Admin Dashboard
- Login ด้วย Supabase Auth
- อนุมัติ/ไม่อนุมัติคำขอเพิ่ม/แก้ไขรายชื่อ
- จัดการกิจกรรม + ข่าวสาร + แบบสำรวจ
- ดูโพสต์ไม่เคลื่อนไหวเพื่อลบ

---

## 💻 เทคโนโลยีที่ใช้

| เทคโนโลยี | ใช้ทำอะไร |
|---|---|
| **Vite 8** | Build tool เร็ว |
| **React 19** | UI Library |
| **TypeScript 6** | Type safety |
| **Tailwind CSS 4** | Styling |
| **React Router 7** | Client-side routing |
| **Supabase** | Database + Auth + Storage |
| **Lucide React** | Icons |
| **Vercel** | Hosting & Deploy |

---

## 📁 โครงสร้างโปรเจค

```
nco-contact/
├── public/
│   └── logo.jpg                     # โลโก้
├── supabase/
│   ├── schema.sql                   # ตาราง contacts + user_roles (เดิม)
│   ├── schema_v2.sql                # ตาราง events, news, posts, comments
│   ├── schema_v3.sql                # ตาราง surveys, survey_options, survey_votes
│   ├── schema_v4_storage.sql        # Supabase Storage bucket
│   ├── schema_v5_survey_images.sql  # ตาราง survey_images
│   ├── schema_v6_news_images.sql    # ตาราง news_images
│   └── schema_v7_edit_requests.sql  # คอลัมน์ type, contact_id, edit_data
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── EventCard.tsx            # การ์ดกิจกรรม + countdown
│   │   ├── EventForm.tsx            # ฟอร์มเพิ่ม/แก้ไขกิจกรรม
│   │   ├── NewsCard.tsx             # การ์ดข่าวสาร + gallery
│   │   ├── NewsForm.tsx             # ฟอร์มเพิ่ม/แก้ไขข่าว
│   │   ├── PostCard.tsx             # การ์ดโพสต์ + คอมเมนต์
│   │   ├── PostForm.tsx             # ฟอร์มโพสต์ข้อความ
│   │   ├── SurveyCard.tsx           # การ์ดโหวต + ผลโหวต
│   │   └── SurveyForm.tsx           # ฟอร์มสร้างโหวต + upload รูป
│   ├── pages/
│   │   ├── HomePage.tsx             # หน้าหลัก (ข่าว + โหวต + กิจกรรม)
│   │   ├── ContactsPage.tsx         # รายชื่อเพื่อนๆ + ค้นหา/กรอง
│   │   ├── EventsPage.tsx           # หน้ากิจกรรมทั้งหมด
│   │   ├── NewsPage.tsx             # หน้าข่าวสารทั้งหมด
│   │   ├── SurveysPage.tsx          # หน้าแบบสำรวจ/โหวต
│   │   ├── BoardPage.tsx            # กระดานสนทนา
│   │   ├── RequestPage.tsx          # ฟอร์มขอเพิ่มรายชื่อ
│   │   └── AdminPage.tsx            # Dashboard จัดการทั้งหมด
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── types.ts                 # TypeScript types
│   │   └── constants.ts             # ตัวเลือก Dropdown (ยศ, เหล่า, กองร้อย)
│   ├── App.tsx                      # Routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Tailwind + global styles
├── .env.local.example               # template env vars
├── .env.local                       # ค่า Supabase (ไม่ commit)
├── vercel.json                      # ตั้งค่า Vercel
├── vite.config.ts                   # ตั้งค่า Vite
└── package.json
```

---

## 🚀 เริ่มต้นใช้งาน

### Prerequisites

- [Node.js](https://nodejs.org/) v18 ขึ้นไป
- [Supabase Account](https://supabase.com) (ฟรี)
- [Vercel Account](https://vercel.com) (ฟรี)

### 1. Clone & ติดตั้ง

```bash
git clone https://github.com/anco1031-sudo/nco-contact.git
cd nco-contact
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> 💡 หาค่าได้ที่ Supabase Dashboard → Project Settings → API

### 3. รัน development server

```bash
npm run dev
```

เปิด http://localhost:5173

---

## ⚙️ ตั้งค่า Supabase

### สร้าง Project

1. ไปที่ [supabase.com](https://supabase.com) → สร้าง project ใหม่
2. คัดลอก **Project URL** และ **anon key** จาก Project Settings → API

### รัน SQL Schema

ไปที่ **SQL Editor** ใน Supabase Dashboard → รันไฟล์ SQL ตามลำดับ:

| ลำดับ | ไฟล์ | สิ่งที่สร้าง |
|---|---|---|
| 1 | `schema.sql` | ตาราง `contacts`, `user_roles`, `requests` |
| 2 | `schema_v2.sql` | ตาราง `events`, `news`, `posts`, `comments` |
| 3 | `schema_v3.sql` | ตาราง `surveys`, `survey_options`, `survey_votes` |
| 4 | `schema_v4_storage.sql` | Supabase Storage bucket `survey-images`, `news-images` |
| 5 | `schema_v5_survey_images.sql` | ตาราง `survey_images` |
| 6 | `schema_v6_news_images.sql` | ตาราง `news_images` |
| 7 | `schema_v7_edit_requests.sql` | เพิ่มคอลัมน์ `type`, `contact_id`, `edit_data` |

> ⚠️ **สำคัญ**: ต้องรันตามลำดับ 1 → 7 เพราะแต่ละตัวสร้างต่อจากตัวก่อนหน้า

---

## 👤 ตั้งค่า Admin

### สร้าง User

1. ไปที่ Supabase Dashboard → **Authentication** → **Users**
2. คลิก **Add user** → กรอกอีเมล + รหัสผ่าน
3. คลิก **Create user**

### ให้สิทธิ์ Admin

ไปที่ **SQL Editor** → รัน:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('uuid-of-admin-user', 'admin');
```

> 💡 หา UUID ได้ที่ Authentication → Users → คลิกที่ User → คัดลอก `User UID`

---

## 🌐 Deploy ขึ้น Vercel

1. ไปที่ [vercel.com](https://vercel.com) → Sign up ด้วย GitHub
2. คลิก **Add New Project**
3. เลือก repo **anco1031-sudo/nco-contact**
4. ใส่ **Environment Variables**:
   - `VITE_SUPABASE_URL` = URL จาก Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key จาก Supabase
5. คลิก **Deploy**

> ทุกครั้งที่ push ขึ้น GitHub จะ auto deploy ให้ทันที

---

## 📖 คำสั่งที่ใช้บ่อย

| คำสั่ง | รายละเอียด |
|---|---|
| `npm run dev` | รัน development server |
| `npm run build` | Build สำหรับ production |
| `npm run preview` | ดู production build 本地 |
| `npm run lint` | Lint โค้ดด้วย Oxlint |

---

## 📐 Database Schema

```
contacts          ← รายชื่อบุคลากร
├── id, rank, first_name, last_name
├── unit, company, workplace
├── phone, line_id, notes
└── created_at

user_roles        ← สิทธิ์ผู้ใช้
├── user_id → auth.users
└── role ('admin')

requests          ← คำขอเพิ่ม/แก้ไขรายชื่อ
├── id, type ('add'|'edit'), contact_id
├── rank, first_name, last_name, unit, company
├── edit_data (JSONB), requester_name
├── status ('pending'|'approved'|'rejected')
└── created_at

events            ← กิจกรรม
├── id, title, description
├── event_date, location
├── status ('survey'|'confirmed'|'in_progress'|'ended')
├── reported_by, reported_phone
└── created_at

news              ← ข่าวสาร
├── id, title, content, category
├── expires_at
├── reported_by, reported_phone
└── created_at

posts             ← กระดานสนทนา
├── id, author_name, content
└── created_at

comments          ← คอมเมนต์
├── id, post_id → posts
├── author_name, content
└── created_at

surveys           ← แบบสำรวจ/โหวต
├── id, title, description
├── image_url, closes_at
├── created_by
└── created_at

survey_options    ← ตัวเลือกโหวต
├── id, survey_id → surveys
└── text

survey_votes      ← ผลโหวต
├── id, survey_id, option_id
└── voter_name (UNIQUE per survey)

survey_images     ← รูปภาพเพิ่มเติมสำหรับโหวต
├── id, survey_id → surveys
└── image_url

news_images       ← รูปภาพข่าวสาร
├── id, news_id → news
└── image_url
```

---

## 🔒 ความปลอดภัย

- **RLS (Row Level Security)** เปิดใช้งานทุกตาราง
- **Admin** เท่านั้นที่แก้ไข/ลบข้อมูลได้
- **User** อ่าน role ของตัวเองได้เท่านั้น (ป้องกัน chicken-and-egg problem)
- **Anonymous** อ่านข้อมูลทั่วไปได้ / ส่งคำขอเท่านั้น

---

## 📝 License

 proyecto personal — นักเรียนนายสิบรุ่นที่ 1333

---

<div align="center">

**🎖️ NCO 1333 — เพื่อนกันจนวันตาย 🎖️**

</div>
