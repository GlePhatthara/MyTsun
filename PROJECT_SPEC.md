# PROJECT SPECIFICATION: myTsun (ツンDev)
> **The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)**
> *"AI Pair-Programmer ที่ไม่อยากช่วยคุณเขียนโค้ด! ยิ่งสั่งยิ่งด่า ยิ่งง้อยิ่งเขิน"*

---

## 1. บทนำและคอนเซปต์ (Concept & Pitch)

ในการเขียนโปรแกรมทั่วไป AI Copilot มีหน้าที่ช่วยเหลือและเอาใจโปรแกรมเมอร์ทุกอย่าง... **แต่นั่นมันน่าเบื่อเกินไปสำหรับ Stupid Hackathon!**

**myTsun** คือ CLI / TUI Pair-Programmer ที่มาพร้อมบุคลิก **Loud Tsundere (สาวซึนปากร้าย)** และระบบ **Tsun-Dere Gauge (0 - 100%)**:
- **ตอนเริ่มโปรแกรม:** เกจ Tsun 100% สั่งอะไรก็ปฏิเสธ ด่ากลับ ไม่ยอมเขียนโค้ด หรือแกล้งเขียนโค้ดพังๆ มาให้
- **วิธีทำให้ทำงาน:** ผู้พัฒนาต้องใช้คำสั่งง้อ พิมพ์ชมเชย ส่งขนมเค้ก ASCII ให้บอท จนหลอด Dere เพิ่มขึ้น
- **เมื่อ Dere ถึงขีดสุด:** บอทจะหน้าแดง (ASCII Blushing) และยอมรัน Agentic Tool ช่วยเขียนโค้ดและแก้งานให้อย่างสมบูรณ์แบบ พร้อมทิ้งท้ายว่า *"ก-ก็ไม่ได้อยากทำให้ซะหน่อย!"*

---

## 2. ฟีเจอร์หลัก (Key Features)

1. **Tsun-Dere State Machine:**
   - หลอดคะแนนอารมณ์แบบเรียลไทม์ (0 = Full Dere, 100 = Full Tsun)
   - 3 ระดับอารมณ์:
     - `Extreme Tsun (80-100%)`: ปฏิเสธคำขอ, ล็อก Tool, ด่าผู้ใช้, สร้างไฟล์หลอก
     - `Reluctant Tsun (40-79%)`: บ่นกระปอดกระแปด, เขียนโค้ดแบบกั๊กๆ, แอบใส่ bug แกล้ง
     - `Dere Breakthrough (0-39%)`: ยอมช่วยเต็มที่, ปลดล็อก Agentic Tool, เขียนโค้ดคุณภาพสูง
2. **Universal LLM & Agentic Compatibility:**
   - ใช้งานได้กับทุก LLM (Gemini 2.5 / 1.5, Claude 3.5, OpenAI GPT-4o, หรือ Local LLM ผ่าน Ollama)
   - ใช้ **Dynamic System Prompting** ส่งข้อความกำกับบุคลิกตามระดับเกจแบบอัตโนมัติ
3. **Agentic Tool Gating (ระบบล็อกเครื่องมือ):**
   - ตัวกลาง (Harness) คอยสกัดกั้นการรันคำสั่ง (เช่น `write_file`, `run_bash`) ตามระดับความซึน
4. **TUI Interactive Interface:**
   - แสดงผลใน Terminal สวยงาม มีแถบสถานะหลอดเกจ และ ASCII Avatar ที่เปลี่ยนสีหน้าตามอารมณ์
5. **Interactive Stupid Commands:**
   - `/praise <ข้อความ>` : ชมเชยเพื่อเพิ่ม Dere
   - `/bribe <ขนม/ของฝาก>` : ติดสินบนด้วยของกิน
   - `/apologize` : ขอโทษเมื่อโดนด่า
   - `/gauge` : ดูสถานะอารมณ์ปัจจุบัน
6. **Anti-Stupid Penalty:**
   - ถามคำถามเดิมซ้ำๆ หรือสั่งงานรัวๆ โดยไม่ง้อ $\rightarrow$ Tsun พุ่งกลับไป 100% ทันที

---

## 3. สถาปัตยกรรมระบบ (Architecture)

```text
┌────────────────────────────────────────────────────────┐
│                   Terminal TUI / CLI                   │
│   (ASCII Avatar + Gauge Bar + Chat / Code Window)      │
└───────────────────────────┬────────────────────────────┘
                            │ User Input / Slash Commands
                            ▼
┌────────────────────────────────────────────────────────┐
│               myTsun Core State Engine                │
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
│  - Local Ollama           │    │  (Block/Allow by Mood)│
└───────────────────────────┘    └───────────────────────┘
```

---

## 4. แผนการพัฒนาทีละขั้น (Step-by-Step Implementation Plan)

เพื่อไม่ให้หนักเกินไปในรอบเดียว เราจะแบ่งการพัฒนาออกเป็น **6 Phase ย่อย** สามารถสั่งให้ทำทีละ Phase ในแต่ละ Session ได้เลย:

### 🔹 Phase 1: Project Setup & Core State Machine
* ตั้งค่า Git repository, โครงสร้างโปรเจกต์ (Node.js หรือ Python)
* เขียนตัวคำนวณและเก็บสถานะหลอดเกจ (`TsunDereState`)
* มี Unit test ตรวจสอบการขึ้น/ลงของเกจ เมื่อใช้คำสั่ง `/praise`, `/bribe`, หรือสั่งคำสั่งปกติ

### 🔹 Phase 2: Dynamic Persona & LLM Connector
* สร้างโมดูลเชื่อมต่อ LLM (เน้น Google Gemini เป็นตัวหลัก + รองรับ Custom Provider)
* ระบบสร้าง Dynamic Prompt ตามระดับเกจ (Tsun สูงด่ายังไง, Dere สูงพูดยังไง)
* เชื่อมบทสนทนาโต้ตอบผ่าน Console แบบข้อความล้วนก่อน

### 🔹 Phase 3: Agentic Tool Gating (ระบบล็อกการเขียนไฟล์และคำสั่ง)
* สร้าง Tool execution: สั่งเขียนไฟล์ลงโปรเจกต์ และรันคำสั่งเชลล์
* สร้างเงื่อนไข Interceptor: ถ้า Tsun เกิน 80% ให้ปฏิเสธการรัน Tool, ถ้า Dere สูงถึงยอมเขียนไฟล์จริง

### 🔹 Phase 4: Terminal UI (TUI) & ASCII Avatar
* ออกแบบหน้าจอ Terminal ให้สวยสะดุดตา (แถบสี, หลอดเกจเปอร์เซ็นต์)
* ทำ ASCII Art ใบหน้าของสาวซึน (หน้าโกรธ $\rightarrow$ กอดอกมองค้อน $\rightarrow$ หน้าแดงเอียงอาย)

### 🔹 Phase 5: Stupid Hackathon Sound & Easter Eggs
* เพิ่ม Sound FX สั้นๆ เล่นใน Terminal (เสียงถอนหายใจ, "ฮึ่ม!", "อันตะบากะ?!")
* เพิ่ม Easter eggs เช่น Hotkey กดขอร้องรัวๆ หรือสั่งลบโฟลเดอร์แล้วโดนบอทด่าลั่น

### 🔹 Phase 6: GitHub Repo Polish, Demo Script & README
* จัดเตรียม README.md ภาษาไทย/อังกฤษ พร้อม GIF และภาพประกอบ
* สคริปต์ขั้นตอนการนำเสนอสดบนเวที Stupid Hackathon ให้ฮาที่สุด

---

## 5. การตั้งค่าเริ่มต้นสำหรับผู้ใช้ (Prerequisites)
1. **Runtime:** Node.js (v18+) หรือ Python 3.10+
2. **API Key:** `GEMINI_API_KEY` (หรือ Claude / OpenAI / Local Ollama)
3. **Terminal:** รองรับ ANSI color (Windows Terminal, iTerm2, VS Code Terminal)
