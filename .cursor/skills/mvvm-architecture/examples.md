# MVVM Examples — KakaoBankApp

## Reference feature: `accounts`

```text
src/features/accounts/
├── types/account.ts
├── services/accountApi.ts
├── hooks/useAccountViewModel.ts
└── presenters/AccountListPresenter.tsx

src/components/accounts/AccountCard.tsx   # dumb UI piece
app/(tabs)/index.tsx                      # thin screen wiring
```

### Model — types

```ts
// types/account.ts
export type AccountApiItem = {
  id: string;
  name: string;
  balance: number;
  encrytedAccountNumber: string; // keep API typo as-is
};

export type Account = AccountApiItem & {
  account_number: string; // decrypted in ViewModel
};
```

### Model — service

```ts
// services/accountApi.ts
export async function fetchAccountsPage(page: number, perPage: number) {
  const baseUrl = process.env.EXPO_PUBLIC_ACCOUNTS_API_URL!;
  const url = `${baseUrl}?_page=${page}&_per_page=${perPage}&_limit=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Accounts API ${res.status}`);
  return res.json() as Promise<AccountApiItem[]>;
}
```

### ViewModel

```ts
// hooks/useAccountViewModel.ts
export function useAccountViewModel() {
  // owns: accounts, loading flags, pagination, decrypt, Alert on error
  // calls: fetchAccountsPage, fetchEncryptionSecretKey, decryptAes128Ecb
  return { accounts, isLoading, refresh, loadMore, /* ... */ };
}
```

### View — Presenter (props only)

```tsx
// presenters/AccountListPresenter.tsx
export type AccountListPresenterProps = {
  accounts: Account[];
  isLoading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
};

export const AccountListPresenter = memo(function AccountListPresenter(
  props: AccountListPresenterProps,
) {
  // FlatList + skeleton + Pressable — no fetch / no crypto
  return (/* UI */);
});
```

### Screen wiring

```tsx
// app/(tabs)/index.tsx
const vm = useAccountViewModel();
return (
  <AccountListPresenter
    accounts={vm.accounts}
    isLoading={vm.isLoading}
    onRefresh={vm.refresh}
    onLoadMore={vm.loadMore}
  />
);
```

## New feature scaffold

When adding `src/features/payments/`:

1. `types/payment.ts`
2. `services/paymentApi.ts`
3. `hooks/usePaymentViewModel.ts`
4. `presenters/PaymentListPresenter.tsx`
5. Thin route under `app/` that only wires the ViewModel → Presenter
