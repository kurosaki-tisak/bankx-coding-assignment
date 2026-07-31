/**
 * Raw account item from mock json-server `GET /accounts`.
 * Field name `encrytedAccountNumber` matches the mock db (typo preserved).
 */
export type AccountApiItem = {
  id: number | string;
  name: string;
  balance: number;
  encrytedAccountNumber: string;
};

/**
 * Account after ViewModel decryption — ready for the Presenter.
 * Preserves every API field; adds plaintext `account_number`.
 */
export type Account = AccountApiItem & {
  account_number: string;
};

export type AccountsPageResult = {
  items: AccountApiItem[];
  totalCount: number | null;
};
