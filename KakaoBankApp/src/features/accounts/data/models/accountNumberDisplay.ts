/**
 * Formats decrypted account numbers for display (presentation helpers stay pure).
 */

export function formatAccountNumberGrouped(value: string): string {
  const digits = value.replace(/\s+/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function maskAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, '');
  if (digits.length <= 4) {
    return '••••';
  }
  return `•••• •••• ${digits.slice(-4)}`;
}

export function resolveAccountNumberLabel(
  accountNumber: string,
  revealed: boolean,
): string {
  if (revealed) {
    return formatAccountNumberGrouped(accountNumber);
  }
  return maskAccountNumber(accountNumber);
}
