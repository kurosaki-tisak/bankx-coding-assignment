import type {
  AccountApiItem,
  AccountsPageResult,
} from '../models/account';

function isAccountApiItem(value: unknown): value is AccountApiItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    (typeof item.id === 'number' || typeof item.id === 'string') &&
    typeof item.name === 'string' &&
    typeof item.balance === 'number' &&
    typeof item.encrytedAccountNumber === 'string'
  );
}

async function parseAccountsResponse(
  response: Response,
): Promise<AccountsPageResult> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as {
        message?: string;
        error?: string;
      };
      detail = body.message || body.error || detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Accounts API must return an array');
  }

  if (!payload.every(isAccountApiItem)) {
    throw new Error('Accounts API returned an unexpected item shape');
  }

  const totalHeader = response.headers.get('X-Total-Count');
  const totalCount =
    totalHeader !== null && totalHeader !== ''
      ? Number(totalHeader)
      : null;

  return {
    items: payload,
    totalCount: Number.isFinite(totalCount) ? totalCount : null,
  };
}

/**
 * Fetches one page of accounts.
 * Sends `_page` + `_per_page` and `_limit` (json-server paginate).
 */
export async function fetchAccountsPage(
  baseUrl: string,
  page: number,
  perPage: number,
): Promise<AccountsPageResult> {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('_page', String(page));
    url.searchParams.set('_per_page', String(perPage));
    url.searchParams.set('_limit', String(perPage));

    const response = await fetch(url.toString());
    return parseAccountsResponse(response);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('โหลดข้อมูลบัญชีไม่สำเร็จ');
  }
}

/**
 * Highest-balance accounts (json-server `_sort=balance&_order=desc`).
 */
export async function fetchTopAccountsByBalance(
  baseUrl: string,
  limit: number,
): Promise<AccountApiItem[]> {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('_sort', 'balance');
    url.searchParams.set('_order', 'desc');
    url.searchParams.set('_limit', String(limit));
    url.searchParams.set('_page', '1');

    const response = await fetch(url.toString());
    const result = await parseAccountsResponse(response);
    return result.items;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('โหลดบัญชียอดสูงไม่สำเร็จ');
  }
}

export async function fetchAccountById(
  baseUrl: string,
  accountId: string,
): Promise<AccountApiItem | null> {
  try {
    const url = new URL(
      `${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(accountId)}`,
    );
    const response = await fetch(url.toString());

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isAccountApiItem(payload)) {
      throw new Error('Accounts API returned an unexpected item shape');
    }
    return payload;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('โหลดบัญชีโปรดไม่สำเร็จ');
  }
}
