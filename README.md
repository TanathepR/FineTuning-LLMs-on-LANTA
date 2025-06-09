# FineTuning-LLMs-on-LANTA
# โครงงาน: ระบบปรับแต่งโมเดลภาษาขนาดใหญ่บนซูเปอร์คอมพิวเตอร์ LANTA

## ผู้พัฒนา
**นาย ธนเทพ โรจนไพรวงศ์**  
คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยธรรมศาสตร์  
อีเมล: tanathep.roc@dome.tu.ac.th

---

## คำอธิบายโครงงาน

ระบบเว็บแอปพลิเคชันสำหรับการปรับแต่งโมเดลภาษาขนาดใหญ่ (Large Language Models) บนโครงสร้างพื้นฐานของซูเปอร์คอมพิวเตอร์ LANTA ของประเทศไทย โดยใช้เทคนิค LoRA (Low-Rank Adaptation) เพื่อประหยัดทรัพยากรการประมวลผล

---

## โครงสร้างโฟลเดอร์ (Directory Tree)

```
FineTuning-LLMs-on-LANTA/
│
├── README.md                          # ไฟล์คำอธิบายโครงงาน
├── requirements.txt                   # Python dependencies
├── .gitignore                         # ไฟล์ที่ไม่ต้องการให้ Git ติดตาม
│
├── backend/                           # ส่วนเซิร์ฟเวอร์ (Flask)
│   ├── server.py                      # ไฟล์หลักของเซิร์ฟเวอร์
│   ├── .env                           # ตัวแปรสภาพแวดล้อม (ต้องสร้างเอง)
│   ├── app.log                        # ไฟล์บันทึกการทำงาน
│   └── tmp/                           # โฟลเดอร์เก็บไฟล์ชั่วคราว
│       └── (ไฟล์ชั่วคราวจะถูกสร้างอัตโนมัติ)
│
├── frontend/                          # ส่วนหน้าเว็บ (React)
│   ├── package.json                   # Node.js dependencies และ scripts
│   ├── tailwind.config.js             # การตั้งค่า Tailwind CSS
│   ├── .env                           # ตัวแปรสภาพแวดล้อมสำหรับ frontend (ต้องสร้างเอง)
│   ├── public/                        # โฟลเดอร์สาธารณะ
│   │   ├── index.html                 # หน้าเว็บหลัก
│   │   ├── manifest.json              # Web app manifest
│   │   └── robots.txt                 # คำแนะนำสำหรับ web crawler
│   └── src/                           # โค้ดต้นฉบับ React
│       ├── index.js                   # จุดเริ่มต้นของแอปพลิเคชัน
│       ├── App.js                     # คอมโพเนนต์หลัก
│       ├── index.css                  # สไตล์ CSS หลัก
│       ├── App.css                    # สไตล์สำหรับ App component
│       ├── App.test.js                # ไฟล์ทดสอบ
│       ├── reportWebVitals.js         # การวัดประสิทธิภาพ
│       ├── setupTests.js              # การตั้งค่าทดสอบ
│       ├── logo.svg                   # โลโก้ React
│       └── components/                # คอมโพเนนต์ UI ต่างๆ
│           ├── HomePage.js            # หน้าแรก
│           ├── AutomateFineTune.js    # โหมดอัตโนมัติ
│           ├── ManualFineTune.js      # โหมดปรับแต่งเอง
│           ├── WaitingPage.js         # หน้ารอประมวลผล
│           └── AutomateFineTune-LAPTOP-FEP840PG.js # ไฟล์สำรอง
│
└── .ssh/                              # โฟลเดอร์เก็บ SSH keys (ต้องสร้างเอง)
    └── id_rsa                         # SSH private key สำหรับเชื่อมต่อ LANTA
```

---

## ความต้องการของระบบ (System Requirements)

### ซอฟต์แวร์ที่จำเป็น
- **Node.js** เวอร์ชัน 16 ขึ้นไป
- **Python** เวอร์ชัน 3.8 ขึ้นไป
- **npm** หรือ **yarn** package manager
- **Git** สำหรับ version control
- **เว็บเบราว์เซอร์** ที่รองรับ JavaScript (Chrome, Firefox, Safari, Edge)

### การเข้าถึง LANTA HPC
- บัญชีผู้ใช้ LANTA ที่ถูกต้อง
- SSH key pair ที่ได้รับการตั้งค่าแล้ว
- สิทธิ์เข้าถึงโปรเจค: `/project/cb900907-hpctgn/`

---

## วิธีการติดตั้งและใช้งาน

### ขั้นตอนที่ 1: ดาวน์โหลดโครงงาน

```bash
# ดาวน์โหลดจาก Git repository
git clone https://github.com/TanathepR/FineTuning-LLMs-on-LANTA.git
cd FineTuning-LLMs-on-LANTA

```

### ขั้นตอนที่ 2: ติดตั้ง library สำหรับเซิร์ฟเวอร์

```bash

# ติดตั้ง Python dependencies
pip install -r requirements.txt

```

### ขั้นตอนที่ 3: ตั้งค่า Backend Environment Variables


```bash

# ติดตั้ง Python dependencies
cd backend

# สร้างไฟล์ .env สำหรับการตั้งค่าและกรอกข้อมูลตามตัวอย่างด้านล่าง
ni .env
```

สร้างไฟล์ `.env` และกรอกข้อมูลดังนี้:

```env
# การเชื่อมต่อ LANTA HPC
SFTP_HOST=lanta.nstda.or.th
SFTP_PORT=22
SFTP_USERNAME=ชื่อผู้ใช้_LANTA_ของคุณ
SFTP_PRIVATE_KEY=..\.ssh\id_rsa

# การแจ้งเตือนทางอีเมล
ADMIN_EMAIL=อีเมล_ผู้ดูแลระบบ
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_PASS=รหัสผ่าน_แอพลิเคชัน_Gmail
```

### ขั้นตอนที่ 4: ติดตั้งส่วน Frontend (หน้าเว็บ)

```bash
# เข้าไปในโฟลเดอร์ frontend
cd ..\frontend

# ติดตั้ง Node.js dependencies
npm install

# สร้างไฟล์ .env สำหรับการตั้งค่า frontend
ni .env
```

### ขั้นตอนที่ 5: ตั้งค่า Frontend Environment Variables

สร้างไฟล์ `.env` และกรอกข้อมูลดังนี้:

```env
# IP สำหรับการเข้าถึง Terminal
REACT_APP_TERMINAL_IP1=xxx.xxx.xxx.xxx
REACT_APP_TERMINAL_IP2=xxx.xxx.xxx.xxx
```

### ขั้นตอนที่ 6: ตั้งค่า SSH Key

```bash
cd ..\.ssh
# คัดลอก private key ของคุณมาใส่ในโฟลเดอร์ .ssh

```

### ขั้นตอนที่ 7: รันโปรแกรม

```bash
# อยู่ในโฟลเดอร์ frontend
cd frontend

# รันทั้ง frontend และ backend พร้อมกัน
npm run start
```

### ขั้นตอนที่ 8: เข้าใช้งานระบบ

1. เปิดเว็บเบราว์เซอร์และไปที่: `http://localhost:3000`
2. เลือกโหมดการทำงาน:
   - **โหมดอัตโนมัติ**: สำหรับผู้เริ่มต้น
   - **โหมดปรับแต่งเอง**: สำหรับผู้ที่ต้องการควบคุมพารามิเตอร์

---

## วิธีการใช้งาน

### โหมดอัตโนมัติ (AutomateFineTune)
1. เลือกโมเดล (Llama 3-8B หรือ Llama 3-70B)
2. อัปโหลดไฟล์ข้อมูล JSON
3. ระบบจะตั้งค่าพารามิเตอร์ให้อัตโนมัติ
4. กดปุ่มเริ่มการปรับแต่ง

### โหมดปรับแต่งเอง (ManualFineTune)
1. **ขั้นตอนที่ 1**: อัปโหลดชุดข้อมูล JSON
2. **ขั้นตอนที่ 2**: เลือกทรัพยากร (GPU, Memory, Time)
3. **ขั้นตอนที่ 3**: เชื่อมต่อ Terminal ด้วยตนเองและรันคำสั่ง

---

## รูปแบบไฟล์ข้อมูล

ไฟล์ข้อมูลสำหรับการฝึกต้องเป็นรูปแบบ JSON ดังตัวอย่าง:

```json
[
  {
    "instruction": "คำสั่งหรือคำถาม",
    "input": "ข้อมูลเพิ่มเติม (ถ้ามี)",
    "output": "คำตอบที่ต้องการ"
  }
]
```

---

## การแก้ไขปัญหาที่อาจเกิดขึ้น

### ปัญหาการเชื่อมต่อ LANTA
```bash
# ทดสอบการเชื่อมต่อ SSH
ssh ชื่อผู้ใช้@lanta.nstda.or.th

# ตรวจสอบสิทธิ์ SSH key ที่ .ssh\id_rsa
dir .ssh/
```

### ปัญหาการอัปโหลดไฟล์
- ตรวจสอบว่าไฟล์เป็นรูปแบบ JSON ที่ถูกต้อง
- ขนาดไฟล์ต้องไม่เกิน 50MB
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

---

## โมเดลที่รองรับ

| โมเดล | พารามิเตอร์ | หน่วยความจำที่ต้องการ | GPU แนะนำ |
|-------|-------------|------------------------|-----------|
| Llama 3 - 8B | 8 พันล้าน | 16GB | 1 GPU |
| Llama 3 - 70B | 70 พันล้าน | 64GB | 4 GPU |

---

## ข้อจำกัดของระบบ

- รองรับเฉพาะเทคนิค LoRA เท่านั้น
- ไฟล์ข้อมูลขนาดสูงสุด 50MB
- ต้องมีการเชื่อมต่อกับ LANTA HPC
- หลังปรับแต่งโมเดลด้วยตนเองสำเร็จ ผู้ใช้จะต้องเข้าไปดาวน์โหลดโมเดลที่ /project/cb900907-hpctgn/LLaMA-Factory/saves/โมเดลที่ใช้/lora/folderวันเวลาที่ฝึกฝน/
- รองรับเฉพาะไฟล์รูปแบบ JSON

---

## ข้อมูลการติดต่อ

หากมีปัญหาในการติดตั้งหรือใช้งาน กรุณาติดต่อ:

**ธนเทพ โรจนไพรวงศ์**  
อีเมล: tanathep.roc@dome.tu.ac.th  
คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยธรรมศาสตร์

---

## หมายเหตุ

- โครงงานนี้พัฒนาขึ้นเพื่อการศึกษาและการวิจัย
- ต้องมีบัญชี LANTA ที่ถูกต้องในการใช้งาน และมีสิทธิ์เข้าถึงโฟลเดอร์โครงการเดียวกับระบบ
- ควรสำรองข้อมูลสำคัญก่อนการใช้งาน

---

*เวอร์ชัน 0.1 - พัฒนาโดยธนเทพ โรจนไพรวงศ์ นักศึกษามหาวิทยาลัยธรรมศาสตร์*
