import { Alert } from 'react-native';

import type {
  AccountApiItem,
  AccountsPageResult,
} from '../models/account';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

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

/**
 * Fetches one page of accounts from mobile-react-native-json-server.
 * Sends `_page` + `_per_page` (project rule) and `_limit` (json-server paginate).
 */
export async function fetchAccountsPage(
  page: number,
  perPage: number,
): Promise<AccountsPageResult> {
  try {
    const baseUrl = requireEnv('EXPO_PUBLIC_ACCOUNTS_API_URL');
    const url = new URL(baseUrl);
    url.searchParams.set('_page', String(page));
    url.searchParams.set('_per_page', String(perPage));
    url.searchParams.set('_limit', String(perPage));

    const response = await fetch(url.toString());

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = (await response.json()) as {
          message?: string;
          error?: string;
        };
        detail = body.message || body.error || detail;
      } catch {
        // ignore non-JSON error bodies from intermittent mock failures
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'โหลดข้อมูลบัญชีไม่สำเร็จ';
    Alert.alert('เกิดข้อผิดพลาด', message);
    throw error;
  }
}
