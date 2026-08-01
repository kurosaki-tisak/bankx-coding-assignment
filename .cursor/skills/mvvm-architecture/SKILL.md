---
name: mvvm-architecture
description: >-
  Enforce Model-View-ViewModel (MVVM) for KakaoBankApp (React Native / Expo)
  with feature folders under data/, presentation/, native/ and shared core/.
  Use when adding features, screens, hooks, repositories, API, native bridges,
  or when the user mentions MVVM, ViewModel, presentation, or project structure.
---

# MVVM Architecture (KakaoBankApp)

โปรเจกต์นี้**ต้อง**ใช้โครงสร้าง Model-View-ViewModel (MVVM) ตามแผนผังด้านล่าง

## โครงสร้างเป้าหมาย

```text
src/
├── features/
│   └── accounts/
│       ├── data/                # [Model Layer]
│       │   ├── api/             # Account API (json-server fetch)
│       │   ├── repositories/    # Data sync & Firestore key management
│       │   └── models/          # Account type definitions
│       ├── presentation/        # [View & ViewModel Layer]
│       │   ├── components/      # UI cards / lists (props only)
│       │   ├── hooks/           # ViewModel (useAccountViewModel)
│       │   └── screens/         # AccountListScreen
│       └── native/              # [Native Bridge Layer]
│           └── AesDecryptor/    # Native module interface
├── core/
│   ├── firebase/                # Firestore setup
│   └── theme/                   # Colors, typography (Kakao yellow, cards)
```

ฟีเจอร์อื่น (เช่น `navigation`) ใช้รูปแบบเดียวกัน: `data/` + `presentation/`

| Layer | โฟลเดอร์ | หน้าที่ |
|-------|----------|--------|
| **Model** | `data/api`, `data/repositories`, `data/models` | types, fetch, sync, key management |
| **ViewModel** | `presentation/hooks/use*ViewModel.ts` | UI state, pagination, side effects |
| **View** | `presentation/components`, `presentation/screens` | props in → UI out |
| **Native** | `native/` | bridge ไป Expo native module |
| **Core** | `core/firebase`, `core/theme` | shared infra / design tokens |

## กฎบังคับ

1. **ห้าม** เขียน logic ดึงข้อมูล, คำนวณสเตต, หรือคริปโตใน UI components โดยตรง
2. Components รับค่าผ่าน Props และ render ตามสเตตเท่านั้น
3. ViewModel เรียก **repository** — ไม่เรียก Firestore/API/crypto ตรง ๆ (ยกเว้น orchestration เบา ๆ)
4. AES decrypt ผ่าน `features/accounts/native/AesDecryptor` เท่านั้น
5. สี/spacing จาก `src/core/theme` เท่านั้น
6. `app/` เป็น thin route: re-export หรือ wire screen จาก `presentation/screens`

## Checklist ก่อนจบงาน

```text
MVVM Progress:
- [ ] models ใน data/models
- [ ] api ใน data/api (ไม่มี UI)
- [ ] repositories สำหรับ sync / key (ไม่มี UI)
- [ ] useXxxViewModel ใน presentation/hooks
- [ ] components รับ props อย่างเดียว
- [ ] screen ใน presentation/screens wire ViewModel → View
- [ ] app/ route บาง ๆ
```

## Anti-patterns

- `fetch` / decrypt / Firebase ใน `presentation/components`
- เก็บ theme หรือ Firebase setup ใน feature โดยไม่ใช้ `core/`
- God screen ใน `app/` ที่โหลดข้อมูลและวาด UI ทั้งก้อน

รายละเอียดตัวอย่าง: [examples.md](examples.md)
