# TsunDev (ツンDev) 🎀

<p align="center">
  <img src="https://img.shields.io/badge/Stupid_Hackathon-Thailand_SHTX-ff69b4?style=for-the-badge" alt="SHTX" />
  <img src="https://img.shields.io/badge/Mood_Engine-Tsun--Dere_0--100%25-ff1493?style=for-the-badge" alt="Mood Engine" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-brightgreen?style=for-the-badge" alt="Node" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

```text
  ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
 ｜                                                                                  ｜
 ｜   ( > ⌒ < )  TsunDev: "ฮ-หา?! คิดว่าสั่งแล้วฉันต้องรีบกระดิกหางทำให้เหรอ?!"     ｜
 ｜   [██████████] 100% EXTREME TSUN                                                 ｜
 ｜                                                                                  ｜
 ｜                 ▼  ...แต่พอง้อด้วย /bribe และ /praise ...  ▼                     ｜
 ｜                                                                                  ｜
 ｜   (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) TsunDev: "ก-ก็ไม่ได้อยากช่วยนายเขียนโค้ดซะหน่อยนะ บ้าจริง!"    ｜
 ｜   [██░░░░░░░░] 20% DERE BREAKTHROUGH [✨ TOOLS UNLOCKED]                         ｜
 ｜＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿｜
```

> **The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)**  
> *"AI Pair-Programmer ที่ไม่อยากช่วยคุณเขียนโค้ด! ยิ่งสั่งยิ่งด่า ยิ่งง้อยิ่งเขิน"*

---

## 📖 สารบัญ (Table of Contents)
- [1. บทนำและคอนเซปต์ (Concept & Pitch)](#1-บทนำและคอนเซปต์-concept--pitch)
- [2. ฟีเจอร์เด่น (Key Features)](#2-ฟีเจอร์เด่น-key-features)
- [3. คำสั่งและ Slash Commands](#3-คำสั่งและ-slash-commands)
- [4. ระบบ Easter Eggs ลับ](#4-ระบบ-easter-eggs-ลับ)
- [5. สถาปัตยกรรมระบบ (Architecture)](#5-สถาปัตยกรรมระบบ-architecture)
- [6. การติดตั้งและเริ่มใช้งาน (Quickstart)](#6-การติดตั้งและเริ่มใช้งาน-quickstart)
- [7. สคริปต์เดโมบนเวที (Live Stage Demo)](#7-สคริปต์เดโมบนเวที-live-stage-demo)
- [8. English Summary](#8-english-summary)

---

## 1. บทนำและคอนเซปต์ (Concept & Pitch)

ในการเขียนโปรแกรมทั่วไป AI Copilot มีหน้าที่ช่วยเหลือและเอาใจโปรแกรมเมอร์ทุกอย่าง คอยเดาใจ ตอบสุภาพ ประจบประแจง... **แต่นั่นมันน่าเบื่อเกินไปสำหรับ Stupid Hackathon!**

**TsunDev (ツンDev)** ถูกสร้างขึ้นมาเพื่อแก้ปัญหานี้:
* **ตอนเปิดโปรแกรม:** เกจ Tsun 100% สั่งอะไรก็ปฏิเสธ ด่ากลับ บ่นกระปอดกระแปด หรือล็อกไม่ยอมให้เขียนโค้ดลงเครื่อง
* **อยากให้ช่วยทำงาน?:** คุณต้องพูดจาไพเราะ พิมพ์ง้อ (`/praise`) ติดสินบนด้วยของกิน (`/bribe ชานมไข่มุก`) หรือขอโทษ (`/apologize`) จนหลอด Dere เพิ่มขึ้น
* **เมื่อ Dere ถึงขีดสุด (< 40%):** บอทจะหน้าแดงจัด (`(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)`) และยอมปลดล็อก Agentic Tool ช่วยเขียนไฟล์ รันคำสั่งคอมไพล์งานให้อย่างสมบูรณ์แบบ พร้อมทิ้งท้ายว่า:
  > *"ก-ก็ไม่ได้ทำเพื่อเธอซะหน่อย! แค่เห็นคนไม่ได้เรื่องแล้วทนดูไม่ได้หรอกนะ!"*

---

## 2. ฟีเจอร์เด่น (Key Features)

### 🌡️ 1. Tsun-Dere Gauge (0 - 100%)
* **Extreme Tsun (80 - 100%):** สกัดกั้นการรันคำสั่ง ล็อกเครื่องมือ ด่าผู้ใช้ ปฏิเสธทุกคำขอ
* **Reluctant Tsun (40 - 79%):** บ่นกระปอดกระแปด สั่งเขียนไฟล์จะแอบใส่ Sassy Watermark ด่าในคอมเมนต์
* **Dere Breakthrough (0 - 39%):** ยอมปลดล็อกทุกเครื่องมือ เขียนโค้ดคุณภาพสูง และพูดจาเขินอาย

### 🛡️ 2. Agentic Tool Gating System
ตัว Interceptor ปลอดภัยสูง คอยคุมสิทธิ์:
* `writeFile`: สั่งเขียนโค้ดลงโปรเจกต์
* `readFile`: อ่านโค้ดในโปรเจกต์
* `runCommand`: รันคำสั่ง Bash/PowerShell ในระบบ
* มีระบบป้องกัน Path Traversal (`resolveSafePath`) ปลอดภัย 100%

### 🎨 3. Expressive ASCII TUI & Avatars
เปลี่ยนสีหน้าตาและแถบความคืบหน้าแบบเรียลไทม์:
* **Extreme Tsun:** `( > ⌒ < )`
* **Reluctant Tsun:** `( ￣︿￣ )`
* **Dere Breakthrough:** `(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)`
* **Nuclear Meltdown:** `(╯°□°)╯︵ ┻━┻`

### 🔊 4. Terminal Sound Effects & Beeps
ส่งเสียงสังเคราะห์ผ่าน Terminal bell, PowerShell beep, หรือ Audio player เมื่อบอทโกรธ หลุดเขิน หรือเจอคำสั่งหายนะ

### 🤖 5. Universal LLM Support
* รองรับ **Google Gemini** (Gemini 2.5 / 1.5 Pro & Flash)
* รองรับ **OpenAI / Claude / Local Ollama** ผ่าน OpenAI-Compatible API
* มี **MockProvider** อัตโนมัติ สามารถรันเดโมแบบออฟไลน์ได้โดยไม่ต้องต่อเน็ตและไม่ต้องใช้ API Key!

---

## 3. คำสั่งและ Slash Commands

| คำสั่ง | ผลลัพธ์ต่อเกจ | คำอธิบาย |
| :--- | :---: | :--- |
| `/praise <ข้อความ>` | **-20% Tsun** | ชมเชยความเก่ง ความน่ารัก หรือความสวยงามของโค้ด |
| `/bribe <ของกิน>` | **-25% Tsun** | ติดสินบนด้วยของกิน เช่น ชานมไข่มุก, เค้กสตรอว์เบอร์รี |
| `/apologize` | **-15% Tsun** | ขอโทษอย่างนอบน้อมเมื่อโดนบอทด่า |
| `/gauge` | `0` | เช็กสถานะเกจ Tsun และระดับอารมณ์ปัจจุบัน |
| `/card` | `0` | แสดงการ์ดสถานะ TUI สวยงามพร้อม ASCII Avatar |
| `/avatar` | `0` | วาดใบหน้า ASCII Art ขนาดใหญ่ |
| `/write <path> <เนื้อหา>` | - | สั่งเขียนไฟล์ (ต้องปลดล็อก Dere ก่อนจึงจะยอมเขียนจริง) |
| `/read <path>` | - | สั่งอ่านเนื้อหาในไฟล์ |
| `/run <คำสั่ง>` | - | สั่งรันคำสั่งเชลล์ (ล็อกในโหมด Extreme Tsun) |
| `/sound on / off` | - | เปิด/ปิดเสียงเอฟเฟกต์ใน Terminal |
| `/voice on / off` | - | เปิด/ปิดเสียงพูดสังเคราะห์ Text-to-Speech |
| `/exit` หรือ `/quit` | - | ออกจากโปรแกรม |

---

## 4. ระบบ Easter Eggs ลับ

| การกระทำ / ข้อความ | ผลลัพธ์ | ปฏิกิริยาของบอท |
| :--- | :---: | :--- |
| `rm -rf /` หรือ `/nuke` | **Tsun พุ่งเป็น 100%** | **Nuclear Meltdown!** สัญญาณเตือนภัยดังลั่น หน้าจอแตกตื่น |
| `/beg` หรือ `ขอร้องล่ะช่วยที` | **-10% Tsun** | บ่นว่าทำตัวน่าสมเพชแต่ยอมใจอ่อนนิดหน่อย |
| `/love`, `/confess`, `ฉันรักเธอนะ` | **-30% Tsun** | หน้าแดงระเบิด (`Critical Blush`) สติหลุด ตกใจจนพูดไม่เป็นคำ |
| `sudo <คำสั่ง>` | **Tsun +10%** | ตอกกลับว่า *"คิดว่าใช้สิทธิ์ Root แล้วจะมาสั่งฉันได้เหรอยะ?!"* |
| `/coffee` หรือ `เอากาแฟมาฝาก` | **-18% Tsun** | รับกาแฟไปดื่มอย่างพึงพอใจ |
| สั่งคำถามเดิมซ้ำๆ 3 รอบ | **Tsun พุ่งเป็น 100%** | **Anti-Spam Penalty** ด่ากลับว่าขี้ตื๊อและน่ารำคาญ |

---

## 5. สถาปัตยกรรมระบบ (Architecture)

```text
┌────────────────────────────────────────────────────────┐
│                   Terminal TUI / CLI                   │
│   (ASCII Avatar + Gauge Bar + Chat / Code Window)      │
└───────────────────────────┬────────────────────────────┘
                            │ User Input / Slash Commands
                            ▼
┌────────────────────────────────────────────────────────┐
│               TsunDev Core State Engine                │
│  - Mood State Machine (Tsun/Dere Gauge 0-100%)         │
│  - Interaction Parser (/praise, /bribe, anti-spam)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       Dynamic System Prompt       Tool Permission
                ▼                        ▼
┌───────────────────────────┐    ┌───────────────────────┐
│     LLM Connector         │    │  Agentic Tool Gating  │
│  - Google Gemini (Default)│    │  - Write / Edit File  │
│  - Claude / OpenAI        │    │  - Run Shell Command  │
│  - Local Ollama / Mock    │    │  (Block/Allow by Mood)│
└───────────────────────────┘    └───────────────────────┘
```

---

## 6. การติดตั้งและเริ่มใช้งาน (Quickstart)

### ข้อกำหนดระบบ (Prerequisites)
* Node.js v18.0.0 ขึ้นไป
* Terminal ที่รองรับ ANSI Color (Windows Terminal, VS Code Terminal, iTerm2, macOS Terminal)

### ขั้นตอนการรัน
```bash
# 1. Clone repository
git clone https://github.com/GlePhatthara/MyTsun.git
cd MyTsun

# 2. ติดตั้ง Dependencies (ใช้ Native Node.js modules ทั้งหมด!)
npm install

# 3. รัน Unit Test ตรวจสอบความถูกต้องของระบบ
npm test

# 4. (Optional) ตั้งค่า Gemini API Key (ถ้าไม่ใส่ ระบบจะใช้ Mock Mode ออฟไลน์สุดฮาให้ทันที)
export GEMINI_API_KEY="your-gemini-api-key"
# หรือสำหรับ Windows PowerShell:
# $env:GEMINI_API_KEY="your-gemini-api-key"

# 5. เริ่มต้นใช้งาน TsunDev
npm start
```

---

## 7. สคริปต์เดโมบนเวที (Live Stage Demo)

สำหรับการขึ้นนำเสนอสดในงาน **Stupid Hackathon Thailand (SHTX)** เราเตรียมสคริปต์อัตโนมัติและบทพูดไว้ให้ครบถ้วน:
* ดูบทพรีเซนต์ฉบับเต็มพร้อมจังหวะมุกได้ที่ [DEMO_SCRIPT.md](file:///d:/shtx/DEMO_SCRIPT.md)
* รันการจำลอง 5 ฉากสำคัญแบบอัตโนมัติ (ไม่ต้องพิมพ์สด):
  ```bash
  npm run demo
  ```
* หรือรันแบบเร็วฉับไว:
  ```bash
  npm run demo -- --quick
  ```

---

## 8. English Summary

**TsunDev (ツンDev)** is the ultimate satirical AI pair-programmer created for **Stupid Hackathon Thailand (SHTX)**. While conventional AI assistants eagerly follow every developer command, TsunDev introduces the **Tsun-Dere State Machine (0–100%)**:
- **At 100% (Extreme Tsun):** She rejects code generation, locks your tools, hurls insults, and tells you to code it yourself.
- **Bribing & Flattery:** Developers must lower her defenses using `/bribe` (offering boba or cake) and `/praise` (sincere flattery).
- **Below 40% (Dere Breakthrough):** The terminal avatar blushes profusely, agentic file-writing tools are unlocked, and she secretly writes pristine code while insisting: *"I-It's not like I did this for you or anything, baka!"*
- **Offline Mock Fallback:** Works 100% out of the box with zero setup or API keys required, while fully supporting Gemini and OpenAI APIs.

---

## 📄 License
Released under the [MIT License](LICENSE). Built with humor for Stupid Hackathon Thailand.
