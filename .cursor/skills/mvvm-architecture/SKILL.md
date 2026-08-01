---
name: mvvm-architecture
description: >-
  Enforce Model-View-ViewModel (MVVM) for KakaoBankApp (React Native / Expo).
  Custom Hook = ViewModel, Presenter/Component = View, types/services = Model.
  Use when adding features, screens, hooks, presenters, API/services, or when
  the user mentions MVVM, ViewModel, Presenter, feature folder structure,
  or UI/business logic separation.
---

# MVVM Architecture (KakaoBankApp)

โปรเจกต์นี้**ต้อง**ใช้โครงสร้าง Model-View-ViewModel (MVVM) ทุกฟีเจอร์

| Layer | ในโปรเจกต์นี้คือ | หน้าที่ |
|-------|------------------|--------|
| **Model** | `types/`, `services/` | ชนิดข้อมูล + เรียก API/แหล่งข้อมูล |
| **ViewModel** | `hooks/use*ViewModel.ts` | สเตต, ดึงข้อมูล, คำนวณ, crypto, side effects |
| **View** | `presenters/`, UI components | รับ props แล้วแสดงผลอย่างเดียว (stateless) |

## กฎบังคับ

1. **ห้าม** เขียน logic ดึงข้อมูล, คำนวณสเตต, หรือคริปโตกราฟีในคอมโพเนนต์ UI โดยตรง
2. Presenter/UI **รับค่าผ่าน Props** และ render ตามสเตตเท่านั้น (Pure / Stateless)
3. แยกโฟลเดอร์ตามฟีเจอร์ที่ `src/features/[feature_name]/`
4. Screen ใน `app/` เป็นตัวประกอบบางๆ: เรียก ViewModel → ส่ง props เข้า Presenter
5. Shared UI ที่ไม่ผูกฟีเจอร์หนักๆ วางที่ `src/components/` แต่ยังคงเป็น dumb components

## โครงสร้างโฟลเดอร์ฟีเจอร์

```text
src/features/[feature_name]/
├── types/           # Model — types / mappers
├── services/        # Model — API / data access (try/catch ที่ caller หรือ service)
├── hooks/           # ViewModel — useXxxViewModel.ts
└── presenters/      # View — XxxPresenter.tsx (props in, UI out)
```

ตัวอย่างอ้างอิง: `src/features/accounts/`  
รายละเอียดเพิ่ม: [examples.md](examples.md)

## Checklist ก่อนจบงาน

คัดลอกแล้วติ๊กให้ครบ:

```text
MVVM Progress:
- [ ] สร้าง/อัปเดต types ใน features/.../types
- [ ] สร้าง/อัปเดต services ใน features/.../services (ไม่มี UI)
- [ ] สร้าง/อัปเดต useXxxViewModel (สเตต + side effects อยู่ที่นี่)
- [ ] Presenter รับ props อย่างเดียว — ไม่มี fetch/crypto/business calc
- [ ] Screen ใน app/ แค่ wire ViewModel → Presenter
- [ ] ไม่มี process.env / Alert / API call ใน Presenter (ยกเว้นถ้าโปรเจกต์กำหนดชัด — ค่าเริ่มต้น: อยู่ที่ ViewModel)
```

## หน้าที่แต่ละชั้น

### Model (`types/`, `services/`)

- นิยาม type ให้ตรง API response (รวม typo ของ mock ถ้ามี เช่น `encrytedAccountNumber`)
- ฟังก์ชัน fetch/pagination (`_page`, `_per_page`) อยู่ที่ service
- ไม่ import React Native UI

### ViewModel (`hooks/use*ViewModel.ts`)

- ถือ `useState` / `useEffect` / `useCallback` สำหรับโหลด, refresh, pagination
- เรียก services + crypto/Firebase ที่นี่
- ครอบ fetch ด้วย try/catch; error จาก API → `Alert.alert`
- export type ผลลัพธ์ชัดเจน เช่น `UseXxxViewModelResult`
- **ห้าม** return JSX

### View (`presenters/`, dumb components)

- Props สำหรับ data + callbacks (`onRefresh`, `onLoadMore`, …)
- Loading / skeleton / empty / error UI จาก props
- ใช้ theme tokens จาก `src/theme/` เท่านั้น
- ปุ่ม/การ์ดใช้ `Pressable` + tactile feedback
- **ห้าม** `fetch`, crypto, hardcode secrets, หรือคำนวณธุรกิจซับซ้อนใน View

### Screen (`app/...`)

```tsx
export default function FeatureScreen() {
  const vm = useFeatureViewModel();
  return (
    <FeaturePresenter
      items={vm.items}
      isLoading={vm.isLoading}
      onRefresh={vm.refresh}
      onLoadMore={vm.loadMore}
    />
  );
}
```

## Anti-patterns (ห้าม)

- `useEffect` + `fetch` ใน Presenter / `AccountCard`
- decrypt / Firebase ในไฟล์ UI
- โฟลเดอร์ฟีเจอร์แบนแบนที่ `app/` หรือ `components/` โดยไม่มี `hooks` + `presenters`
- God component ที่ทั้งโหลดข้อมูลและวาด UI ในไฟล์เดียว

## เมื่อรีวิวหรือรีแฟกเตอร์

1. หา logic ใน UI → ย้ายเข้า ViewModel
2. หา side effects ใน Presenter → ย้ายเข้า ViewModel
3. ตรวจว่าทุกฟิลด์จาก API ถูก map ใน Model/ViewModel และแสดงใน View
