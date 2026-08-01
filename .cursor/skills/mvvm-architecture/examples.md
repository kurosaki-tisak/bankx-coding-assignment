# MVVM Examples — KakaoBankApp

## Accounts feature tree

```text
src/features/accounts/
├── data/
│   ├── api/accountApi.ts
│   ├── repositories/accountRepository.ts
│   ├── repositories/encryptionKeyRepository.ts
│   └── models/account.ts
├── presentation/
│   ├── components/AccountCard.tsx
│   ├── components/AccountList.tsx
│   ├── hooks/useAccountViewModel.ts
│   └── screens/AccountListScreen.tsx
└── native/
    └── AesDecryptor/index.ts

src/core/
├── firebase/index.ts
└── theme/index.ts

app/(tabs)/index.tsx  → re-export AccountListScreen
```

## Data flow

1. `AccountListScreen` → `useAccountViewModel`
2. ViewModel → `fetchDecryptedAccountsPage` (repository)
3. Repository → `accountApi` + `encryptionKeyRepository` + `AesDecryptor`
4. ViewModel state → `AccountList` / `AccountCard` (props only)

## Screen wiring

```tsx
// presentation/screens/AccountListScreen.tsx
const vm = useAccountViewModel();
return (
  <AccountList
    accounts={vm.accounts}
    isLoading={vm.isLoading}
    onRefresh={vm.refresh}
    onLoadMore={vm.loadMore}
  />
);
```

```tsx
// app/(tabs)/index.tsx
export { default } from '@/src/features/accounts/presentation/screens/AccountListScreen';
```
